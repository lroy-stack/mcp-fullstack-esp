import React, { useState, useEffect } from 'react';
import { Dialog, CustomDialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/custom-dialog';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Card, CardContent } from '@/components/ui/card';
import { ZoneSelector, ZONE_CONFIGURATIONS } from '@/components/ui/zone-selector';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTableAvailability, type AvailabilityCheckParams } from '@/hooks/useTableAvailability';
import useTableCombinations from '@/hooks/useTableCombinations';
import { getTableDisplayNameFromData } from '@/utils/tableUtils';
import { X, Users, MapPin, Check, AlertCircle, Filter, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('TableSelectionModal');

interface TableSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (tableId: string) => void;
  reservationGuests: number;
  preferredZone?: string;
  currentTableId?: string;
  // Nuevos props para validación de disponibilidad
  reservationDate?: string; // YYYY-MM-DD
  reservationTime?: string; // HH:MM
  estimatedDuration?: number; // minutos
  excludeReservationId?: number; // Para excluir reserva actual al editar
}

export function TableSelectionModal({
  isOpen,
  onClose,
  onSelectTable,
  reservationGuests,
  preferredZone,
  currentTableId,
  reservationDate,
  reservationTime,
  estimatedDuration,
  excludeReservationId
}: TableSelectionModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>(currentTableId || '');
  const [selectedZone, setSelectedZone] = useState<string>(preferredZone || '');
  const [viewMode, setViewMode] = useState<'zone' | 'tables'>('zone');
  const { data: tables = [], isLoading } = useTablesWithStates();
  const { activeCombinations, isTableInCombination } = useTableCombinations();
  
  // Hook para verificar disponibilidad (solo si tenemos fecha y hora)
  const availabilityParams: AvailabilityCheckParams | null = 
    reservationDate && reservationTime ? {
      fecha: reservationDate,
      hora: reservationTime,
      duracionMinutos: estimatedDuration,
      excludeReservationId
    } : null;

  const { data: tableAvailabilities = [], isLoading: isLoadingAvailability } = 
    useTableAvailability(availabilityParams || { fecha: '', hora: '' });

  // Función para obtener información de disponibilidad de una mesa
  const getTableAvailability = (tableId: string | number) => {
    if (!availabilityParams) return { isAvailable: true, conflicts: [], nextAvailableTime: undefined };
    
    const availability = tableAvailabilities.find(a => a.tableId === parseInt(tableId.toString()));
    return {
      isAvailable: availability?.isAvailable ?? true,
      conflicts: availability?.conflictingReservations ?? [],
      nextAvailableTime: availability?.nextAvailableTime
    };
  };

  // Función auxiliar segura para comparar zonas
  const isZoneMatch = (tableZone: any, targetZone: string | undefined): boolean => {
    if (!targetZone || typeof targetZone !== 'string' || !tableZone) return false;
    
    // Comparar código directo
    if (tableZone.codigo === targetZone) return true;
    
    // Comparar nombre (solo si ambos son strings)
    if (tableZone.nombre && typeof tableZone.nombre === 'string') {
      return tableZone.nombre.toLowerCase() === targetZone.toLowerCase();
    }
    
    return false;
  };

  // Debug: Log de estructura de datos
  useEffect(() => {
    if (tables.length > 0) {
      logger.debug('🔍 DEBUG TableSelectionModal - Datos de mesas:', tables);
      logger.debug('🔍 DEBUG - Primera mesa estructura:', tables[0]);
      logger.debug('🔍 DEBUG - Zonas encontradas:', tables.map(t => t.zona));
      logger.debug('🔍 DEBUG - Estados encontrados:', tables.map(t => t.estado));
    }
  }, [tables]);

  useEffect(() => {
    setSelectedTableId(currentTableId || '');
    setSelectedZone(preferredZone || '');
  }, [currentTableId, preferredZone]);

  // Filtrar mesas disponibles considerando estado actual Y disponibilidad temporal
  const availableTables = tables.filter(table => {
    // Mesa actual siempre disponible
    if (table.id === currentTableId) return true;
    
    // Verificar estado actual de la mesa (libre o sin estado)
    const isCurrentlyFree = !table.estado || table.estado?.estado === 'libre';
    
    // Si no tenemos validación temporal, usar solo estado actual
    if (!availabilityParams) return isCurrentlyFree;
    
    // Verificar disponibilidad temporal
    const timeAvailability = getTableAvailability(table.id);
    
    // Mesa disponible si está libre AHORA Y disponible en el horario solicitado
    return isCurrentlyFree && timeAvailability.isAvailable;
  });
  
  // Debug: Log mesas disponibles
  useEffect(() => {
    logger.debug('🔍 DEBUG - Mesas disponibles:', availableTables);
    logger.debug('🔍 DEBUG - Total mesas:', tables.length, 'Disponibles:', availableTables.length);
  }, [availableTables, tables]);

  // Filtrar mesas por zona seleccionada usando función segura
  const filteredTables = selectedZone 
    ? availableTables.filter(table => isZoneMatch(table.zona, selectedZone))
    : availableTables;

  // Agrupar mesas por zona usando el código de zona
  const tablesByZone = filteredTables.reduce((acc, table) => {
    const zone = table.zona?.codigo || table.zona?.nombre || 'Sin zona';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(table);
    return acc;
  }, {} as Record<string, typeof tables>);

  // Obtener zonas disponibles usando códigos de zona
  const availableZones = [...new Set(
    availableTables
      .map(table => table.zona?.codigo || table.zona?.nombre)
      .filter(Boolean)
  )];
  
  // Debug: Log filtrado por zona
  useEffect(() => {
    logger.debug('🔍 DEBUG - selectedZone:', selectedZone, 'tipo:', typeof selectedZone);
    logger.debug('🔍 DEBUG - availableZones:', availableZones);
    logger.debug('🔍 DEBUG - tablesByZone:', tablesByZone);
    logger.debug('🔍 DEBUG - filteredTables:', filteredTables);
  }, [selectedZone, availableZones, tablesByZone, filteredTables]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    setViewMode('tables');
    setSelectedTableId(''); // Reset table selection when changing zone
  };

  const handleBackToZones = () => {
    setViewMode('zone');
    setSelectedZone('');
    setSelectedTableId('');
  };

  // Calcular si una mesa es adecuada para el número de comensales
  const getTableSuitability = (tableId: string, tableCapacity: number) => {
    // Check if this table is part of a combination
    const combination = isTableInCombination(tableId);
    const effectiveCapacity = combination ? combination.totalCapacity : tableCapacity;
    
    if (effectiveCapacity === reservationGuests) return 'perfect';
    if (effectiveCapacity > reservationGuests && effectiveCapacity <= reservationGuests + 2) return 'good';
    if (effectiveCapacity < reservationGuests) return 'small';
    return 'large';
  };

  // Get the effective capacity for display
  const getEffectiveCapacity = (tableId: string, tableCapacity: number) => {
    const combination = isTableInCombination(tableId);
    return combination ? combination.totalCapacity : tableCapacity;
  };

  // Check if a table is the primary table in a combination
  const isPrimaryTableInCombination = (tableId: string) => {
    const combination = isTableInCombination(tableId);
    if (!combination) return false;
    
    // Primary table is the lowest numbered table in the combination
    const sortedTableIds = [...combination.tableIds].sort((a, b) => {
      const tableA = tables.find(t => t.id === a);
      const tableB = tables.find(t => t.id === b);
      return (tableA?.numero_mesa || 0) - (tableB?.numero_mesa || 0);
    });
    
    return sortedTableIds[0] === tableId;
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'perfect': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'small': return 'bg-red-100 text-red-800 border-red-200';
      case 'large': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuitabilityLabel = (suitability: string) => {
    switch (suitability) {
      case 'perfect': return 'Perfecta';
      case 'good': return 'Adecuada';
      case 'small': return 'Pequeña';
      case 'large': return 'Grande';
      default: return '';
    }
  };

  const handleConfirm = () => {
    if (selectedTableId) {
      onSelectTable(selectedTableId);
      onClose();
    }
  };

  const zoneDisplayNames = {
    'justicia': '⚖️ Terraza Justicia',
    'campanar': '🌿 Terraza Campanar', 
    'interior': '🏛️ Sala Interior',
    'vip': '👑 Sala VIP'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-enigma-primary/10 rounded-xl flex items-center justify-center">
                {viewMode === 'zone' ? <MapPin className="w-5 h-5 text-enigma-primary" /> : <Filter className="w-5 h-5 text-enigma-primary" />}
              </div>
              <div>
                <span className="ios-text-title2 font-bold text-enigma-primary">
                  {viewMode === 'zone' ? 'Seleccionar Zona' : `Mesas en ${selectedZone ? (ZONE_CONFIGURATIONS[selectedZone]?.displayName || selectedZone) : 'Zona seleccionada'}`}
                </span>
                <p className="ios-text-callout text-gray-600 font-normal">
                  {reservationGuests} comensales{preferredZone && ` • Zona preferida: ${preferredZone ? (ZONE_CONFIGURATIONS[preferredZone]?.displayName || preferredZone) : 'No especificada'}`}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modal para seleccionar mesa y zona para la reserva
            </DialogDescription>
            <div className="flex items-center gap-2">
              {viewMode === 'tables' && (
                <TouchOptimizedCTA
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToZones}
                  className="text-enigma-primary"
                >
                  ← Cambiar zona
                </TouchOptimizedCTA>
              )}
              <TouchOptimizedCTA
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500"
              >
                <X className="w-4 h-4" />
              </TouchOptimizedCTA>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enigma-primary"></div>
            </div>
          ) : viewMode === 'zone' ? (
            <div className="space-y-6">
              {/* Debug info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Debug Info</h4>
                <p className="text-blue-800 text-sm">Zonas disponibles: {availableZones.join(', ') || 'Ninguna'}</p>
                <p className="text-blue-800 text-sm">Total mesas: {tables.length}</p>
                <p className="text-blue-800 text-sm">Mesas disponibles: {availableTables.length}</p>
              </div>
              
              {availableZones.length > 0 ? (
                <ZoneSelector
                  selectedZone={selectedZone}
                  onZoneSelect={handleZoneSelect}
                  preferredZone={preferredZone}
                  guestCount={reservationGuests}
                  availableZones={availableZones}
                />
              ) : (
                <div className="space-y-4">
                  <h3 className="ios-text-headline font-semibold text-gray-900">
                    Zonas Encontradas en la Base de Datos
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[...new Set(tables.map(table => table.zona?.nombre || table.zona?.codigo).filter(Boolean))].map((zoneName) => (
                      <div
                        key={zoneName}
                        className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white/30 cursor-pointer hover:border-enigma-primary/30"
                        onClick={() => handleZoneSelect(zoneName!)}
                      >
                        <h4 className="font-semibold text-gray-900">{zoneName}</h4>
                        <p className="text-sm text-gray-600">
                          {tables.filter(t => (t.zona?.nombre === zoneName || t.zona?.codigo === zoneName)).length} mesas
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : Object.keys(tablesByZone).length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay mesas disponibles en esta zona
              </h3>
              <p className="text-gray-600 mb-4">
                Todas las mesas están ocupadas en {ZONE_CONFIGURATIONS[selectedZone]?.displayName || selectedZone}
              </p>
              <TouchOptimizedCTA
                variant="outline"
                onClick={handleBackToZones}
              >
                Seleccionar otra zona
              </TouchOptimizedCTA>
            </div>
          ) : (
            Object.entries(tablesByZone).map(([zone, zoneTables]) => (
              <div key={zone} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {zoneDisplayNames[zone] || zone}
                  <IOSBadge variant="secondary" className="text-xs">
                    {zoneTables.length} mesas
                  </IOSBadge>
                  {zone === preferredZone && (
                    <IOSBadge variant="success" className="text-xs">
                      Zona preferida
                    </IOSBadge>
                  )}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zoneTables.map(table => {
                    const combination = isTableInCombination(table.id);
                    const isPrimary = isPrimaryTableInCombination(table.id);
                    const effectiveCapacity = getEffectiveCapacity(table.id, table.capacidad);
                    const suitability = getTableSuitability(table.id, table.capacidad);
                    const isSelected = selectedTableId === table.id;
                    const isCurrent = currentTableId === table.id;
                    const availability = getTableAvailability(table.id);
                    
                    // Only allow selection of primary tables in combinations, or individual tables
                    const isSelectable = !combination || isPrimary;
                    
                    return (
                      <Card
                        key={table.id}
                        className={cn(
                          "transition-all duration-200",
                          isSelectable && "cursor-pointer hover:shadow-md",
                          !isSelectable && "opacity-60 cursor-not-allowed bg-gray-50",
                          isSelected && "ring-2 ring-enigma-primary shadow-lg",
                          isCurrent && "bg-blue-50 border-blue-200",
                          combination && !isPrimary && "border-dashed border-gray-300"
                        )}
                        onClick={() => isSelectable && setSelectedTableId(table.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-900">
                                {getTableDisplayNameFromData(table.numero_mesa, table.zona_id)}
                              </span>
                              {combination && (
                                <IOSBadge 
                                  variant="outline" 
                                  className="text-xs border-green-400 text-green-600"
                                  style={{ backgroundColor: 'var(--combination-active)', color: 'white', borderColor: 'var(--combination-border)' }}
                                >
                                  {isPrimary ? 'Combinación' : 'Secundaria'}
                                </IOSBadge>
                              )}
                              {isCurrent && (
                                <IOSBadge variant="outline" className="text-xs border-blue-400 text-blue-600">
                                  Actual
                                </IOSBadge>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-enigma-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                Capacidad: {effectiveCapacity} personas
                                {combination && table.capacidad !== effectiveCapacity && (
                                  <span className="text-gray-500 ml-1">
                                    (individual: {table.capacidad})
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            {/* Show combination details */}
                            {combination && (
                              <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                <strong>{combination.name}</strong>
                                <div className="text-gray-500">
                                  Mesas: {combination.tableIds.map(id => {
                                    const t = tables.find(table => table.id === id);
                                    return t ? getTableDisplayNameFromData(t.numero_mesa, t.zona_id) : id;
                                  }).join(', ')}
                                </div>
                                {!isPrimary && (
                                  <div className="text-orange-600 font-medium">
                                    ⚠️ Solo se puede reservar desde la mesa principal
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <IOSBadge 
                              className={cn("text-xs", getSuitabilityColor(suitability))}
                            >
                              {getSuitabilityLabel(suitability)} para {reservationGuests} personas
                            </IOSBadge>

                            {/* Información de disponibilidad temporal */}
                            {availabilityParams && (
                              <div className="space-y-1">
                                {availability.isAvailable ? (
                                  <IOSBadge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Disponible en horario
                                  </IOSBadge>
                                ) : (
                                  <div className="space-y-1">
                                    <IOSBadge variant="destructive" className="text-xs">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Conflicto de horario
                                    </IOSBadge>
                                    {availability.nextAvailableTime && (
                                      <div className="text-xs text-gray-500">
                                        Libre desde: {format(availability.nextAvailableTime, 'HH:mm', { locale: es })}
                                      </div>
                                    )}
                                    {availability.conflicts.length > 0 && (
                                      <div className="text-xs text-red-600 space-y-0.5">
                                        {availability.conflicts.slice(0, 1).map((conflict, idx) => (
                                          <div key={idx} className="truncate">
                                            {conflict.nombre_reserva} ({format(conflict.hora_inicio, 'HH:mm')} - {format(conflict.hora_fin, 'HH:mm')})
                                          </div>
                                        ))}
                                        {availability.conflicts.length > 1 && (
                                          <div className="text-gray-400">
                                            +{availability.conflicts.length - 1} más...
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {table.estado?.estado !== 'libre' && table.id !== currentTableId && (
                              <IOSBadge variant="destructive" className="text-xs">
                                {table.estado?.estado}
                              </IOSBadge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con botones de acción */}
        {viewMode === 'tables' && (
          <div className="px-6 py-4 border-t border-white/20 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="ios-text-callout text-gray-600">
                {selectedTableId && (() => {
                  const selectedTable = tables.find(t => t.id === selectedTableId);
                  return selectedTable ? (
                    <span>
                      Mesa seleccionada: <strong className="text-enigma-primary">{getTableDisplayNameFromData(selectedTable.numero_mesa, selectedTable.zona_id)}</strong>
                    </span>
                  ) : null;
                })()}
              </div>
              
              <div className="flex gap-3">
                <TouchOptimizedCTA
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancelar
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!selectedTableId}
                  icon={Check}
                  iconPosition="left"
                >
                  {currentTableId ? 'Cambiar Mesa' : 'Asignar Mesa'}
                </TouchOptimizedCTA>
              </div>
            </div>
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}