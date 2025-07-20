// Ejemplo: Grid de Mesas con Drag & Drop y Estados en Tiempo Real
// Patrón: Real-time Updates + Drag & Drop + Optimistic Updates + State Management

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTableStates } from '@/hooks/use-table-states';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { assignReservationToTable } from '@/app/actions/tables';
import { toast } from '@/hooks/use-toast';

// Tipos
type TableState = 'libre' | 'ocupada' | 'reservada' | 'limpieza' | 'fuera_servicio';

interface Table {
  id: number;
  numero_mesa: number;  // Campo real de la DB
  capacidad: number;
  zona_id: number;
  zona: { nombre: string; codigo: string };
  estado_actual: TableState;
  activa: boolean;
  combinable: boolean;
  reserva_activa?: {
    id: number;
    nombre_reserva: string;  // Campo real de la DB
    numero_personas: number;
    fecha_hora: string;
  };
}

interface Reservation {
  id: number;
  nombre_reserva: string;  // Campo real de la DB
  telefono_reserva: string;
  email_reserva?: string;
  numero_personas: number;
  fecha_reserva: string;
  hora_reserva: string;
  mesa_id?: number;
  estado: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada' | 'no_show';
}

// Configuración de colores por estado
const TABLE_STATE_CONFIG = {
  libre: { 
    color: 'bg-green-500 hover:bg-green-600', 
    text: 'Libre',
    textColor: 'text-white' 
  },
  ocupada: { 
    color: 'bg-blue-600 hover:bg-blue-700', 
    text: 'Ocupada',
    textColor: 'text-white' 
  },
  reservada: { 
    color: 'bg-orange-500 hover:bg-orange-600', 
    text: 'Reservada',
    textColor: 'text-white' 
  },
  limpieza: { 
    color: 'bg-yellow-500 hover:bg-yellow-600', 
    text: 'Limpieza',
    textColor: 'text-white' 
  },
  fuera_servicio: { 
    color: 'bg-gray-500', 
    text: 'Fuera de Servicio',
    textColor: 'text-white' 
  },
} as const;

// Componente Mesa Individual
function TableCard({ table, onTableClick }: { table: Table; onTableClick: (table: Table) => void }) {
  const stateConfig = TABLE_STATE_CONFIG[table.estado_actual];
  
  const [{ isOver }, drop] = useDrop({
    accept: 'reservation',
    drop: (item: { reservation: Reservation }) => {
      handleReservationDrop(item.reservation, table);
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleReservationDrop = async (reservation: Reservation, targetTable: Table) => {
    if (targetTable.estado_actual !== 'libre') {
      toast({
        title: "Mesa No Disponible",
        description: `La mesa ${targetTable.numero} no está disponible para asignación.`,
        variant: "destructive",
      });
      return;
    }

    if (reservation.numero_personas > targetTable.capacidad) {
      toast({
        title: "Capacidad Insuficiente",
        description: `La mesa ${targetTable.numero} tiene capacidad para ${targetTable.capacidad} personas, pero la reserva es para ${reservation.numero_personas}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await assignReservationToTable(reservation.id, targetTable.id);
      
      if (result.success) {
        toast({
          title: "Mesa Asignada",
          description: `Reserva de ${reservation.cliente_nombre} asignada a mesa ${targetTable.numero}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error de Asignación",
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: "destructive",
      });
    }
  };

  const getUrgencyIndicator = () => {
    if (!table.reserva_activa) return null;
    
    const reservationTime = new Date(table.reserva_activa.fecha_hora);
    const now = new Date();
    const minutesUntil = Math.floor((reservationTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (minutesUntil <= 15) {
      return <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />;
    } else if (minutesUntil <= 30) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    return null;
  };

  return (
    <Card 
      ref={drop}
      className={cn(
        "cursor-pointer transition-all duration-200 min-h-[120px]",
        stateConfig.color,
        isOver && "ring-2 ring-blue-400 scale-105",
        table.estado_actual === 'libre' && "hover:scale-105"
      )}
      onClick={() => onTableClick(table)}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-bold text-lg", stateConfig.textColor)}>
              Mesa {table.numero}
            </h3>
            <p className={cn("text-sm opacity-90", stateConfig.textColor)}>
              {table.zona.nombre}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {getUrgencyIndicator()}
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {table.capacidad}
            </Badge>
          </div>
        </div>

        <div className="mt-3">
          <Badge 
            variant="outline" 
            className={cn("text-xs", stateConfig.textColor, "border-white/30")}
          >
            {stateConfig.text}
          </Badge>
          
          {table.reserva_activa && (
            <div className={cn("mt-2 text-xs", stateConfig.textColor)}>
              <p className="font-medium">{table.reserva_activa.cliente_nombre}</p>
              <p className="opacity-80">
                {table.reserva_activa.numero_personas} personas
              </p>
              <p className="opacity-80">
                {new Date(table.reserva_activa.fecha_hora).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Reserva Arrastrable
function DraggableReservation({ reservation }: { reservation: Reservation }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'reservation',
    item: { reservation },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card 
      ref={drag}
      className={cn(
        "cursor-move transition-all duration-200 border-dashed",
        isDragging && "opacity-50 rotate-3"
      )}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">{reservation.cliente_nombre}</p>
            <p className="text-xs text-gray-600">
              {reservation.numero_personas} personas
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">
              {new Date(reservation.fecha_hora).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <Badge variant="outline" size="sm">
              Sin Mesa
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Principal
interface TableGridProps {
  onTableClick?: (table: Table) => void;
  className?: string;
}

export function TableGrid({ onTableClick = () => {}, className = "" }: TableGridProps) {
  const { tables, isLoading, error } = useTableStates();
  const [unassignedReservations, setUnassignedReservations] = useState<Reservation[]>([]);

  // Activar actualizaciones en tiempo real
  useRealtimeUpdates(['tables', 'reservations']);

  // Cargar reservas sin mesa asignada
  useEffect(() => {
    const loadUnassignedReservations = async () => {
      try {
        const response = await fetch('/api/reservations?mesa_id=null&estado=confirmada');
        const data = await response.json();
        if (data.success) {
          setUnassignedReservations(data.reservations);
        }
      } catch (error) {
        console.error('Error loading unassigned reservations:', error);
      }
    };

    loadUnassignedReservations();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">Error al cargar las mesas: {error.message}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reintentar
        </Button>
      </Card>
    );
  }

  // Agrupar mesas por zona
  const tablesByZone = tables.reduce((acc: Record<string, Table[]>, table: Table) => {
    const zoneName = table.zona.nombre;
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("space-y-8", className)}>
        {/* Reservas Sin Mesa Asignada */}
        {unassignedReservations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Reservas Sin Mesa Asignada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unassignedReservations.map(reservation => (
                <DraggableReservation 
                  key={reservation.id} 
                  reservation={reservation} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Grid de Mesas por Zona */}
        {Object.entries(tablesByZone).map(([zoneName, zoneTables]: [string, Table[]]) => (
          <div key={zoneName}>
            <h3 className="text-lg font-semibold mb-4">{zoneName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {zoneTables.map((table: Table) => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  onTableClick={onTableClick}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          {Object.entries(TABLE_STATE_CONFIG).map(([state, config]) => (
            <div key={state} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", config.color)} />
              <span className="text-sm">{config.text}</span>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}