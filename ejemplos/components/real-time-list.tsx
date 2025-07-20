// Ejemplo: Lista con Actualizaciones en Tiempo Real y Virtual Scrolling
// Patrón: Real-time Subscriptions + Virtual Scrolling + Optimistic Updates + Error Handling

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import { toast } from '@/hooks/use-toast';

// Tipos
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  status: 'active' | 'pending' | 'completed' | 'error';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RealtimeListProps<T extends ListItem> {
  data: T[];
  tableName: string;
  schema?: string;
  filter?: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
  onItemClick?: (item: T) => void;
  onItemUpdate?: (item: T) => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
  height?: number;
  itemHeight?: number;
  loading?: boolean;
  error?: string;
}

// Hook para gestión de estado de la lista en tiempo real
function useRealtimeList<T extends ListItem>(
  initialData: T[],
  tableName: string,
  schema: string = 'public'
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // Configurar subscripción en tiempo real
  const { subscribe, unsubscribe, isConnected } = useRealtimeSubscription({
    schema,
    table: tableName,
    onInsert: (payload) => {
      const newItem = payload.new as T;
      setItems(prev => {
        // Evitar duplicados
        if (prev.some(item => item.id === newItem.id)) {
          return prev;
        }
        return [...prev, newItem];
      });
      setLastUpdate(new Date());
      
      toast({
        title: "Nuevo elemento",
        description: `Se agregó: ${newItem.title}`,
      });
    },
    onUpdate: (payload) => {
      const updatedItem = payload.new as T;
      setItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      setLastUpdate(new Date());
      
      // Remover de pendientes si existía
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updatedItem.id);
        return next;
      });
    },
    onDelete: (payload) => {
      const deletedItem = payload.old as T;
      setItems(prev => prev.filter(item => item.id !== deletedItem.id));
      setLastUpdate(new Date());
      
      toast({
        title: "Elemento eliminado",
        description: `Se eliminó: ${deletedItem.title}`,
        variant: "destructive",
      });
    },
    onError: (error) => {
      console.error('Real-time subscription error:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "Error de conexión",
        description: "Se perdió la conexión en tiempo real",
        variant: "destructive",
      });
    },
    onReconnect: () => {
      setConnectionStatus('connected');
      toast({
        title: "Reconectado",
        description: "Conexión en tiempo real restaurada",
      });
    },
  });

  // Monitorear estado de conexión
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Funciones para actualizaciones optimistas
  const optimisticUpdate = useCallback((itemId: string, updates: Partial<T>) => {
    // Agregar a pendientes
    setPendingUpdates(prev => new Set([...prev, itemId]));
    
    // Aplicar cambio optimista
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const revertOptimisticUpdate = useCallback((itemId: string, originalItem: T) => {
    setPendingUpdates(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? originalItem : item
      )
    );
  }, []);

  return {
    items,
    setItems,
    lastUpdate,
    connectionStatus,
    pendingUpdates,
    optimisticUpdate,
    revertOptimisticUpdate,
    subscribe,
    unsubscribe,
  };
}

// Componente de elemento de lista
function ListItemComponent<T extends ListItem>({ 
  item, 
  index, 
  isPending,
  onClick,
  renderCustom 
}: {
  item: T;
  index: number;
  isPending: boolean;
  onClick?: (item: T) => void;
  renderCustom?: (item: T, index: number) => React.ReactNode;
}) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
  };

  if (renderCustom) {
    return (
      <div className={cn(isPending && "opacity-70 animate-pulse")}>
        {renderCustom(item, index)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-gray-200",
        "hover:bg-gray-50 transition-colors cursor-pointer",
        isPending && "opacity-70 animate-pulse"
      )}
      onClick={() => onClick?.(item)}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-gray-500 truncate mt-1">
            {item.subtitle}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(item.timestamp).toLocaleString()}
        </p>
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          statusColors[item.status]
        )}>
          {item.status}
        </span>
        {isPending && (
          <RefreshCw className="h-3 w-3 ml-2 animate-spin text-gray-400" />
        )}
      </div>
    </div>
  );
}

// Componente principal
export function RealtimeList<T extends ListItem>({
  data,
  tableName,
  schema = 'public',
  filter,
  sort,
  onItemClick,
  onItemUpdate,
  renderItem,
  className,
  height = 400,
  itemHeight = 80,
  loading = false,
  error,
}: RealtimeListProps<T>) {
  const {
    items,
    lastUpdate,
    connectionStatus,
    pendingUpdates,
    optimisticUpdate,
    revertOptimisticUpdate,
  } = useRealtimeList(data, tableName, schema);

  // Procesar items (filtrar y ordenar)
  const processedItems = useMemo(() => {
    let result = [...items];
    
    if (filter) {
      result = result.filter(filter);
    }
    
    if (sort) {
      result.sort(sort);
    }
    
    return result;
  }, [items, filter, sort]);

  // Virtual scrolling con react-window
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedItems[index];
    const isPending = pendingUpdates.has(item.id);
    
    return (
      <div style={style}>
        <ListItemComponent
          item={item}
          index={index}
          isPending={isPending}
          onClick={onItemClick}
          renderCustom={renderItem}
        />
      </div>
    );
  }, [processedItems, pendingUpdates, onItemClick, renderItem]);

  // Indicador de estado de conexión
  const ConnectionIndicator = () => (
    <div className="flex items-center gap-2 text-xs text-gray-500 p-2 border-b">
      {connectionStatus === 'connected' ? (
        <>
          <Wifi className="h-3 w-3 text-green-500" />
          <span>En tiempo real</span>
        </>
      ) : connectionStatus === 'disconnected' ? (
        <>
          <WifiOff className="h-3 w-3 text-red-500" />
          <span>Desconectado</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 animate-spin text-yellow-500" />
          <span>Reconectando...</span>
        </>
      )}
      <span className="ml-auto">
        Última actualización: {lastUpdate.toLocaleTimeString()}
      </span>
    </div>
  );

  // Estados de carga y error
  if (loading) {
    return (
      <div className={cn("border rounded-lg", className)} style={{ height }}>
        <ConnectionIndicator />
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("border rounded-lg", className)} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (processedItems.length === 0) {
    return (
      <div className={cn("border rounded-lg", className)} style={{ height }}>
        <ConnectionIndicator />
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-500">No hay elementos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <ConnectionIndicator />
      
      <List
        height={height - 40} // Restar altura del indicador
        itemCount={processedItems.length}
        itemSize={itemHeight}
        overscanCount={5}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {Row}
      </List>
      
      {/* Información adicional */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
        <span>{processedItems.length} elementos</span>
        {pendingUpdates.size > 0 && (
          <span>{pendingUpdates.size} actualizaciones pendientes</span>
        )}
      </div>
    </div>
  );
}

// Hook para usar con el componente
export function useRealtimeListActions<T extends ListItem>() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map());

  const performOptimisticUpdate = useCallback(async (
    itemId: string,
    updates: Partial<T>,
    serverAction: () => Promise<T>
  ) => {
    try {
      // Aplicar cambio optimista (esto se haría en el componente)
      const result = await serverAction();
      
      // Si el servidor devuelve un resultado diferente, se actualizará automáticamente
      // vía la subscripción en tiempo real
      
      return result;
    } catch (error) {
      // Revertir cambio optimista en caso de error
      throw error;
    }
  }, []);

  return {
    performOptimisticUpdate,
    optimisticUpdates,
  };
}

// Ejemplo de uso
export function RealtimeListExample() {
  const [reservations] = useState<ListItem[]>([
    {
      id: '1',
      title: 'Reserva #1234',
      subtitle: 'Juan Pérez - Mesa 5',
      status: 'active',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2', 
      title: 'Reserva #1235',
      subtitle: 'María García - Mesa 12',
      status: 'pending',
      timestamp: new Date().toISOString(),
    },
  ]);

  return (
    <RealtimeList
      data={reservations}
      tableName="reservas"
      schema="restaurante"
      height={500}
      itemHeight={80}
      onItemClick={(item) => console.log('Clicked:', item)}
      sort={(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()}
      className="w-full max-w-2xl"
    />
  );
}