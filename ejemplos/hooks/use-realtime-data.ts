// Ejemplo: Hook para Subscripciones Supabase en Tiempo Real
// Patrón: Real-time Updates + Optimistic UI + Error Recovery + Performance

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Tipos para las configuraciones de real-time
interface RealtimeConfig {
  table: string;
  schema?: SchemaName;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  select?: string;
}

interface RealtimeHookOptions {
  enabled?: boolean;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  debugMode?: boolean;
}

interface RealtimeState {
  isConnected: boolean;
  isSubscribed: boolean;
  lastMessage: Date | null;
  connectionCount: number;
  errorCount: number;
}

// Importar cliente Supabase configurado para multi-schema
import { SupabaseClientFactory } from '@/lib/supabase';
import type { SchemaName } from '@/types/database';

/**
 * Hook principal para subscripciones en tiempo real
 * 
 * @example
 * ```tsx
 * const { data, state, reconnect } = useRealtimeData({
 *   table: 'reservations',
 *   schema: 'restaurante',
 *   filter: 'status=eq.active'
 * }, {
 *   onUpdate: (payload) => {
 *     toast(`Reserva ${payload.new.id} actualizada`);
 *   },
 *   debugMode: true
 * });
 * ```
 */
export function useRealtimeData<T = any>(
  config: RealtimeConfig,
  options: RealtimeHookOptions = {}
) {
  const {
    enabled = true,
    onInsert,
    onUpdate,
    onDelete,
    onError,
    autoReconnect = true,
    reconnectDelay = 5000,
    debugMode = false
  } = options;

  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isSubscribed: false,
    lastMessage: null,
    connectionCount: 0,
    errorCount: 0
  });

  // Query key para los datos base
  const queryKey = ['realtime-data', config.table, config.schema, config.filter];

  // Obtener datos iniciales
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from(config.table)
        .select(config.select || '*');

      // Aplicar filtros si existen
      if (config.filter) {
        const [column, operator, value] = config.filter.split('=');
        if (operator === 'eq') {
          query = query.eq(column, value);
        } else if (operator === 'neq') {
          query = query.neq(column, value);
        } else if (operator === 'gt') {
          query = query.gt(column, value);
        } else if (operator === 'gte') {
          query = query.gte(column, value);
        } else if (operator === 'lt') {
          query = query.lt(column, value);
        } else if (operator === 'lte') {
          query = query.lte(column, value);
        }
      }

      const { data: result, error: queryError } = await query;
      
      if (queryError) {
        throw new Error(`Error loading data: ${queryError.message}`);
      }

      return result as T[];
    },
    enabled,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Función para manejar actualizaciones optimistas
  const updateOptimistically = useCallback((
    operation: 'insert' | 'update' | 'delete',
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    queryClient.setQueryData(queryKey, (oldData: T[] = []) => {
      switch (operation) {
        case 'insert':
          return [payload.new as T, ...oldData];
        
        case 'update':
          return oldData.map(item => 
            (item as any).id === payload.new.id ? payload.new as T : item
          );
        
        case 'delete':
          return oldData.filter(item => 
            (item as any).id !== payload.old.id
          );
        
        default:
          return oldData;
      }
    });
  }, [queryClient, queryKey]);

  // Función para establecer conexión
  const connect = useCallback(() => {
    if (!enabled || channelRef.current) return;

    const channelName = `realtime:${config.schema || 'public'}:${config.table}:${Date.now()}`;
    
    if (debugMode) {
      console.log(`[useRealtimeData] Connecting to channel: ${channelName}`);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (debugMode) {
            console.log(`[useRealtimeData] Received ${payload.eventType}:`, payload);
          }

          setState(prev => ({
            ...prev,
            lastMessage: new Date()
          }));

          // Actualizaciones optimistas
          updateOptimistically(payload.eventType as any, payload);

          // Callbacks específicos
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status, err) => {
        if (debugMode) {
          console.log(`[useRealtimeData] Subscription status: ${status}`, err);
        }

        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          isSubscribed: status === 'SUBSCRIBED',
          connectionCount: status === 'SUBSCRIBED' ? prev.connectionCount + 1 : prev.connectionCount,
          errorCount: err ? prev.errorCount + 1 : prev.errorCount
        }));

        if (err) {
          onError?.(new Error(`Subscription error: ${err.message || err}`));
          
          // Auto-reconexión si está habilitada
          if (autoReconnect && status === 'CLOSED') {
            if (debugMode) {
              console.log(`[useRealtimeData] Auto-reconnecting in ${reconnectDelay}ms`);
            }
            
            reconnectTimeoutRef.current = setTimeout(() => {
              disconnect();
              connect();
            }, reconnectDelay);
          }
        }
      });

    channelRef.current = channel;
  }, [
    enabled,
    config,
    onInsert,
    onUpdate,
    onDelete,
    onError,
    updateOptimistically,
    autoReconnect,
    reconnectDelay,
    debugMode
  ]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      if (debugMode) {
        console.log('[useRealtimeData] Disconnecting channel');
      }
      
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isSubscribed: false
      }));
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [debugMode]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    if (debugMode) {
      console.log('[useRealtimeData] Manual reconnect triggered');
    }
    
    disconnect();
    connect();
  }, [connect, disconnect, debugMode]);

  // Función para refrescar datos
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Efectos
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Datos
    data: data || [],
    isLoading,
    error,
    
    // Estado de la conexión
    state,
    
    // Funciones de control
    reconnect,
    disconnect,
    refresh,
    
    // Metadatos
    queryKey,
    isConnected: state.isConnected,
    isSubscribed: state.isSubscribed,
    lastMessage: state.lastMessage
  };
}

/**
 * Hook especializado para tablas de reservas
 */
export function useRealtimeReservations(filters?: {
  status?: string;
  date?: string;
  mesa_id?: number;
}) {
  const filterString = filters ? Object.entries(filters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=eq.${value}`)
    .join(',') : undefined;

  return useRealtimeData({
    table: 'reservas',
    schema: 'restaurante',
    filter: filterString,
    select: `
      *,
      cliente:restaurante.clientes(*),
      mesa:restaurante.mesas(numero, zona:restaurante.zonas(nombre))
    `
  }, {
    debugMode: process.env.NODE_ENV === 'development'
  });
}

/**
 * Hook especializado para estados de mesas
 */
export function useRealtimeTableStates() {
  return useRealtimeData({
    table: 'estados_mesa',
    schema: 'operaciones',
    select: `
      *,
      mesa:restaurante.mesas(numero, capacidad, zona:restaurante.zonas(nombre))
    `
  }, {
    onUpdate: (payload) => {
      // Opcional: trigger de notificaciones para cambios de estado
      if (payload.new.estado === 'ocupada') {
        // notificationService.show(`Mesa ${payload.new.mesa?.numero} ocupada`);
      }
    },
    debugMode: process.env.NODE_ENV === 'development'
  });
}

/**
 * Hook para múltiples subscripciones
 */
export function useMultipleRealtimeData(configs: RealtimeConfig[]) {
  const results = configs.map(config => 
    useRealtimeData(config, {
      debugMode: process.env.NODE_ENV === 'development'
    })
  );

  return {
    results,
    isAllConnected: results.every(r => r.isConnected),
    hasAnyError: results.some(r => r.error),
    reconnectAll: () => results.forEach(r => r.reconnect()),
    refreshAll: () => results.forEach(r => r.refresh())
  };
}