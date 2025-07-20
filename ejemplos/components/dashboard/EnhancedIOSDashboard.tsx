import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useReservations, useUpdateReservation } from '@/hooks/useReservations';
import { useTrendingPercentages } from '@/hooks/useTrendingStats';
import { useTablesWithStates } from '@/hooks/useTableStates';
import { useTodayReservations, useRestaurantStats } from '@/hooks/useRestaurantStats';
import { useCustomers } from '@/hooks/useCustomers';
import { useHybridTodayStats } from '@/hooks/useAnalyticsSystem';
import { useRestaurantConfig } from '@/hooks/useRestaurantConfig';
import { useActividadRecienteDashboardHibrido } from '@/hooks/useHistorialUnificado';
import { useAutoConfirmReservation } from '@/hooks/useAutoConfirmReservation';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { ReservationDetailModal } from '@/components/modals/ReservationDetailModal';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  BarChart3,
  Bell,
  User,
  ClipboardList,
  Activity,
  Star,
  Utensils,
  FileText,
  Tag,
  Check,
  Eye,
  X,
  Mail,
  MessageCircle,
  Coffee,
} from 'lucide-react';
import { format, isToday, addHours, isBefore, isAfter, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSpainDate, getTodaySpain, formatSpainDate, isTodaySpain, formatReservationTime } from '@/utils/dateUtils';
import { getTableDisplayNameFromData } from '@/utils/tableUtils';
import WeatherWidget from '@/components/weather/WeatherWidget';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('EnhancedIOSDashboard');

type ActivityType = 'success' | 'info' | 'warning' | 'error';

export function EnhancedIOSDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data hooks - Priorizar sistema analítico
  const { data: hybridStats } = useHybridTodayStats();
  
  // Hook para trending stats reales
  const { trending, hasHistoricalData } = useTrendingPercentages();
  const { data: rawReservasHoy = [] } = useTodayReservations();
  const { data: allReservations = [] } = useReservations();
  const { data: tables = [] } = useTablesWithStates();
  const { data: restaurantStats = [] } = useRestaurantStats();
  const { data: customers = [] } = useCustomers();
  const { data: restaurantConfig } = useRestaurantConfig();
  
  // Actividad reciente - últimas 3 actividades usando sistema híbrido
  const { data: recentActivityData = [] } = useActividadRecienteDashboardHibrido();
  
  // Mutation hooks
  const updateReservationMutation = useUpdateReservation();
  const { confirmAndSendEmail, isConfirming } = useAutoConfirmReservation();

  // Update time every second using Spain timezone
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getSpainDate()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers - Optimized with useCallback
  const handleReservationClick = useCallback((reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  }, []);

  const handleStatusUpdate = useCallback(async (reservationId: string, newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se abra el modal
    
    try {
      if (newStatus === 'confirmada') {
        // Usar confirmación automática con email
        await confirmAndSendEmail({
          reservationId: parseInt(reservationId),
          sendEmail: true
        });
      } else {
        // Comportamiento normal para otros estados
        await updateReservationMutation.mutateAsync({
          id: reservationId,
          estado: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error updating reservation status:', error);
    }
  }, [confirmAndSendEmail, updateReservationMutation]);

  const handleWhatsAppClick = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/\D/g, ''); // Remover caracteres no numéricos
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  }, []);

  const handleEmailClick = useCallback((email: string) => {
    const emailUrl = `mailto:${email}`;
    window.open(emailUrl, '_blank');
  }, []);

  const handleCopyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar un toast de confirmación
      logger.debug(`${type} copiado al portapapeles: ${text}`);
    } catch (error) {
      logger.error('Error copying to clipboard:', error);
    }
  }, []);

  // Procesar reservas de forma segura
  const reservasHoy = Array.isArray(rawReservasHoy) 
    ? rawReservasHoy.filter(reservation => 
        reservation && 
        typeof reservation === 'object' && 
        'estado' in reservation
      )
    : [];

  // Filtrar reservas válidas para hoy (excluir canceladas y no_show para el conteo principal)
  const todayReservations = reservasHoy.filter(reservation => 
    reservation.estado !== 'cancelada_usuario' && 
    reservation.estado !== 'cancelada_restaurante' &&
    reservation.estado !== 'no_show'
  );

  // Get upcoming reservations - SOLO reservas de HOY
  const today = getTodaySpain();
  
  const upcomingReservations = allReservations
    .filter(reservation => {
      // Filtrar SOLO reservas de HOY que no estén canceladas o completadas
      return reservation.fecha_reserva === today &&
             !['cancelada', 'completada', 'no_show', 'cancelada_restaurante'].includes(reservation.estado || '');
    })
    .sort((a, b) => {
      // Ordenar por fecha y hora
      const dateA = `${a.fecha_reserva}T${a.hora_reserva}:00`;
      const dateB = `${b.fecha_reserva}T${b.hora_reserva}:00`;
      return dateA.localeCompare(dateB);
    });
    // Removed slice(0, 8) - Show ALL today's reservations
  
  logger.debug(`📅 Dashboard - Fecha España: ${getTodaySpain()}`);
  logger.debug(`📊 Dashboard - Total reservas: ${allReservations.length}`);
  logger.debug(`📊 Dashboard - Total reservas hoy: ${rawReservasHoy.length}`);
  logger.debug(`⏰ Dashboard - Reservas de HOY activas: ${upcomingReservations.length}`);
  if (upcomingReservations.length > 0) {
    logger.debug(`📝 Dashboard - Lista reservas HOY:`, upcomingReservations.map(r => `${r.nombre_reserva} - ${r.fecha_reserva} ${r.hora_reserva} (${r.estado})`));
  }
  
  // Mostrar información del sistema híbrido
  if (hybridStats) {
    logger.debug(`🔎 Estadísticas híbridas (${hybridStats.source}):`, {
      total: hybridStats.total_reservas,
      confirmadas: hybridStats.confirmadas,
      pendientes: hybridStats.pendientes,
      comensales: hybridStats.total_comensales
    });
  }

  // Usar estadísticas híbridas si están disponibles, sino calcular desde reservas filtradas
  const completedReservations = hybridStats ? hybridStats.completadas : 
    todayReservations.filter(reservation => reservation.estado === 'completada').length;
  const activeReservations = hybridStats ? (hybridStats.confirmadas + hybridStats.pendientes) :
    todayReservations.filter(reservation => 
      reservation.estado === 'confirmada' || reservation.estado === 'pendiente'
    ).length;
  const noShows = hybridStats ? hybridStats.no_shows :
    reservasHoy.filter(reservation => reservation.estado === 'no_show').length;
  
  // Total de reservas válidas (excluyendo canceladas y no_shows para el conteo principal)
  const totalValidReservations = hybridStats ? 
    (hybridStats.total_reservas - hybridStats.canceladas - hybridStats.no_shows) :
    todayReservations.length;

  // Calculate occupancy by zone using real zone names
  const zoneOccupancy = tables.reduce((acc, table) => {
    const zone = table.zona?.nombre || 'Sin zona';
    if (!acc[zone]) {
      acc[zone] = { total: 0, occupied: 0, available: 0, reserved: 0 };
    }
    acc[zone].total++;
    
    const estado = table.estado?.estado || 'libre';
    if (estado === 'ocupada') acc[zone].occupied++;
    else if (estado === 'reservada') acc[zone].reserved++;
    else if (estado === 'libre') acc[zone].available++;
    
    return acc;
  }, {} as Record<string, any>);

  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.estado?.estado === 'ocupada').length;
  const reservedTables = tables.filter(t => t.estado?.estado === 'reservada').length;
  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Debug: Verificar datos de actividad reciente
  logger.debug('🔍 Dashboard - Datos de actividad reciente unificados:', {
    total: recentActivityData.length,
    actividades: recentActivityData
  });

  // Procesar actividad reciente desde sistema de auditoría unificado
  const recentActivity = recentActivityData.map(activity => {
    let type: ActivityType = 'info';
    
    // Mapear tipo basado en nivel_criticidad y tipo_actividad
    if (activity.nivel_criticidad === 'alta') {
      type = 'error';
    } else if (activity.tipo_actividad === 'reserva') {
      type = 'success';
    } else if (activity.tipo_actividad === 'mesa') {
      type = 'info';
    } else if (activity.tipo_actividad === 'cliente' && activity.descripcion.includes('VIP')) {
      type = 'success';
    } else if (activity.tipo_actividad === 'configuracion') {
      type = 'warning';
    }

    return {
      id: String(activity.id),
      action: activity.descripcion,
      time: format(new Date(activity.fecha_actividad), 'HH:mm'),
      type
    };
  }); // Ya viene limitado a 3 desde el hook

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Función para obtener saludo cálido y motivador según horarios reales
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const day = currentTime.getDay();
    const totalReservations = rawReservasHoy.length;
    const activeReservations = upcomingReservations.length;
    
    // Horarios del restaurante (basados en la configuración actual)
    const SYSTEM_OPEN = 9;        // 9:00 AM - sistema abre
    const RESTAURANT_OPEN = 13;   // 1:00 PM - restaurante abre
    const RESTAURANT_CLOSE = 23;  // 11:30 PM - restaurante cierra
    const RESTAURANT_CLOSE_MIN = 30; // :30 minutos
    const STAFF_LEAVE = 1;        // 1:00 AM - personal se va
    
    // Mensajes motivadores según el momento del día real
    let greeting = '';
    let motivation = '';
    let icon = null;
    
    if (hour >= SYSTEM_OPEN && hour < 12) {
      // Mañana: Sistema abierto, preparando el día
      icon = <Calendar className="h-5 w-5 text-amber-500" />;
      greeting = '¡Buenos días, equipo!';
      if (hour < 11) {
        motivation = totalReservations === 0 
          ? 'Perfecto para organizar y preparar todo con calma'
          : `Preparando el día, ${totalReservations} reservas nos esperan`;
      } else {
        motivation = 'Última hora antes de abrir, ¡todo listo para brillar!';
      }
    } else if (hour >= 12 && hour < RESTAURANT_OPEN) {
      // Mediodía: Justo antes de abrir
      icon = <Clock className="h-5 w-5 text-orange-500" />;
      greeting = '¡Casi listos para abrir!';
      motivation = totalReservations > 0 
        ? `${totalReservations} reservas esperando, ¡vamos a por todas!`
        : 'Momento perfecto para los últimos retoques';
    } else if (hour >= RESTAURANT_OPEN && hour < 16) {
      // Servicio de comida
      icon = <Utensils className="h-5 w-5 text-orange-500" />;
      if (day === 0) { // Domingo
        greeting = '¡Domingo de comidas!';
        motivation = activeReservations > 3 
          ? 'Domingo animado, así me gusta' 
          : 'Domingo tranquilo, perfecto para cuidar cada detalle';
      } else if (day === 6) { // Sábado
        greeting = '¡Sábado a tope!';
        motivation = activeReservations > 5 
          ? 'Sábado en plena ebullición, somos máquinas' 
          : 'Sábado relajado, qué gusto';
      } else {
        greeting = '¡Servicio de comidas!';
        motivation = activeReservations > 4 
          ? 'El mediodía más intenso, pero lo dominamos' 
          : 'Fluye genial, el equipo está en su salsa';
      }
    } else if (hour >= 16 && hour < 19) {
      // Descanso entre servicios
      icon = <Coffee className="h-5 w-5 text-purple-500" />;
      greeting = '¡Respiro entre servicios!';
      motivation = activeReservations === 0 
        ? 'Momento de recargar pilas antes de la cena'
        : 'Aún hay movimiento, mantenemos el ritmo';
    } else if (hour >= 19 && (hour < RESTAURANT_CLOSE || (hour === RESTAURANT_CLOSE && minute < RESTAURANT_CLOSE_MIN))) {
      // Servicio de cena - momento mágico
      icon = <Star className="h-5 w-5 text-emerald-500" />;
      greeting = '¡La magia de las cenas!';
      if (activeReservations === 0) {
        motivation = 'Noche tranquila, perfecto para crear momentos únicos';
      } else if (activeReservations <= 4) {
        motivation = 'Ambiente perfecto, justo como nos gusta en Enigma';
      } else {
        motivation = 'Casa llena, aquí es donde somos auténticos artistas';
      }
    } else if ((hour === RESTAURANT_CLOSE && minute >= RESTAURANT_CLOSE_MIN) || hour === 0 || (hour === 1 && minute === 0)) {
      // Cierre del restaurante hasta que se va el personal
      icon = <MapPin className="h-5 w-5 text-blue-500" />;
      if (activeReservations > 0) {
        greeting = '¡Cerrando con estilo!';
        motivation = 'Últimos clientes, cerramos como reyes';
      } else {
        greeting = '¡Día completado!';
        motivation = 'Misión cumplida, ha sido un día genial';
      }
    } else {
      // Fuera de horario (1 AM - 9 AM)
      icon = <MapPin className="h-5 w-5 text-slate-500" />;
      greeting = '¡Enigma descansa!';
      motivation = 'El restaurante duerme, mañana más aventuras';
    }
    
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg sm:text-xl text-enigma-neutral-900 truncate">
            {greeting}
          </div>
          <div className="text-xs sm:text-sm text-enigma-neutral-600 font-medium flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{motivation}</span>
          </div>
          {totalReservations > 0 && (
            <div className="text-xs text-enigma-primary font-semibold mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-2">
              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">{totalReservations} reservas hoy • {activeReservations} activas ahora</span>
                <span className="sm:hidden">{totalReservations} hoy • {activeReservations} activas</span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return '#34C759';
      case 'pendiente': return '#FF9500';
      case 'cancelada':
      case 'cancelada_usuario':
      case 'cancelada_restaurante': return '#FF3B30';
      case 'completada': return '#8E8E93';
      case 'no_show': return '#FF6B6B';
      default: return '#237584';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'cancelada_usuario': return 'Cancelada';
      case 'cancelada_restaurante': return 'Cancelada';
      case 'completada': return 'Completada';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'Terraza Justicia': return '#237584';  // TJ - Primary
      case 'Terraza Campanari': return '#9FB289'; // TC - Secondary
      case 'Sala Principal': return '#CB5910';    // SP - Accent
      case 'Sala VIP': return '#8B5CF6';          // SV - Purple
      default: return '#64748B';                  // Default gray
    }
  };

  const getZoneName = (zone: string) => {
    // Zone names are already correct in database
    return zone || 'Sin zona';
  };
  
  const getZoneCode = (zone: string) => {
    switch (zone) {
      case 'Terraza Justicia': return 'TJ';
      case 'Terraza Campanari': return 'TC';
      case 'Sala Principal': return 'SP';
      case 'Sala VIP': return 'SV';
      default: return '??';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color, 
    icon: Icon, 
    trend,
    hasHistoricalData
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: any;
    trend?: number;
    hasHistoricalData?: boolean;
  }) => (
    <IOSCard 
      variant="elevated" 
      className="ios-touch-feedback transition-all duration-200 hover:scale-102 cursor-pointer"
    >
      <IOSCardContent className="enigma-spacing-md">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="ios-text-footnote text-enigma-neutral-600 mb-2 font-medium uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="ios-text-title1 font-bold text-enigma-neutral-900">
                {value}
              </span>
              {hasHistoricalData && trend !== undefined && (
                <span className={`ios-text-caption1 font-bold flex items-center ${
                  trend > 0 ? 'text-ios-green' : trend < 0 ? 'text-ios-red' : 'text-enigma-neutral-500'
                }`}>
                  {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : null}
                  <span className="ml-1">{Math.abs(trend)}%</span>
                </span>
              )}
            </div>
            <p className="ios-text-caption1 text-enigma-neutral-500 leading-relaxed">
              {subtitle}
            </p>
          </div>
          <div 
            className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={28} color={color} />
          </div>
        </div>
        {hasHistoricalData && trend !== undefined && (
          <div className="flex items-center mt-4 pt-4 border-t border-enigma-neutral-200">
            <span className="ios-text-caption1 text-enigma-neutral-500">vs ayer</span>
          </div>
        )}
        {!hasHistoricalData && (
          <div className="flex items-center mt-4 pt-4 border-t border-enigma-neutral-200">
            <span className="ios-text-caption1 text-enigma-neutral-400 italic">Sin datos históricos</span>
          </div>
        )}
      </IOSCardContent>
    </IOSCard>
  );

  const OccupancyCard = ({ 
    zone, 
    data, 
    color 
  }: {
    zone: string;
    data: any;
    color: string;
  }) => (
    <div className="bg-white rounded-ios p-3 sm:p-4 lg:p-5 shadow-ios border border-enigma-neutral-200">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2" style={{ backgroundColor: color }} />
        <h4 className="ios-text-footnote sm:ios-text-callout font-semibold text-enigma-neutral-900 m-0 truncate">
          {getZoneName(zone)}
        </h4>
      </div>
      
      <div className="mb-2 sm:mb-3">
        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
          <span className="ios-text-caption1 sm:ios-text-footnote text-enigma-neutral-500">Ocupación</span>
          <span className="ios-text-footnote sm:ios-text-callout font-semibold text-enigma-neutral-900">
            {data.occupied + data.reserved}/{data.total}
          </span>
        </div>
        
        <div className="w-full h-1.5 sm:h-2 bg-enigma-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${((data.occupied + data.reserved) / data.total) * 100}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between ios-text-caption2 sm:ios-text-caption1">
        <span className="text-ios-green">Disponibles: {data.available}</span>
        <span className="text-enigma-neutral-500">
          {Math.round(((data.occupied + data.reserved) / data.total) * 100)}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="font-sf">
      {/* Encabezado responsive */}
      <IOSCard variant="default" className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200 mb-6">
        <IOSCardContent className="enigma-spacing-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="mb-2">
                {getTimeBasedGreeting()}
              </div>
              <p className="text-enigma-neutral-500 ios-text-callout">
                {formatDate(currentTime)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-enigma-primary text-white px-4 py-2 rounded-ios ios-text-headline font-semibold min-w-[120px] text-center order-2 sm:order-1">
                {formatTime(currentTime)}
              </div>
              
              <IOSButton 
                variant="primary" 
                onClick={() => navigate('/reservas')}
                className="flex items-center gap-2 bg-enigma-primary hover:bg-enigma-primary/90 text-white order-1 sm:order-2 w-full sm:w-auto justify-center"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Reserva</span>
                <span className="sm:hidden">Nueva</span>
              </IOSButton>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Métricas principales - grid optimizado */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-6">
        <StatCard
          title="Reservas Hoy"
          value={rawReservasHoy.length}
          subtitle={`${activeReservations} activas, ${completedReservations} completadas`}
          color="var(--enigma-primary)"
          icon={Calendar}
          trend={trending.totalReservations}
          hasHistoricalData={hasHistoricalData}
        />
        <StatCard
          title="Ocupación Actual"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedTables + reservedTables} de ${totalTables} mesas ocupadas`}
          color="var(--enigma-secondary)"
          icon={MapPin}
          trend={0}
          hasHistoricalData={false}
        />
        <StatCard
          title="Clientes Totales"
          value={customers.length}
          subtitle={`${customers.filter(c => c.es_vip).length} clientes VIP`}
          color="var(--enigma-accent)"
          icon={Users}
          trend={0}
          hasHistoricalData={false}
        />
        <StatCard
          title="No Shows"
          value={noShows}
          subtitle="Reservas no presentadas hoy"
          color="var(--enigma-neutral-600)"
          icon={Clock}
          trend={trending.noShows}
          hasHistoricalData={hasHistoricalData}
        />
      </section>

      {/* Navegación contextual */}
      <section className="mb-6">
        <IOSCard variant="default" className="bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
          <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
            <IOSCardTitle className="ios-text-headline font-semibold text-enigma-neutral-900">
              Acciones Rápidas
            </IOSCardTitle>
          </IOSCardHeader>
          
          <IOSCardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Gestionar Mesas', icon: MapPin, color: '#237584', bgGradient: 'from-[#237584]/10 to-[#237584]/5', route: '/mesas' },
                { label: 'Nuevo Cliente', icon: User, color: '#9FB289', bgGradient: 'from-[#9FB289]/10 to-[#9FB289]/5', route: '/clientes' },
                { label: 'Reportes', icon: BarChart3, color: '#CB5910', bgGradient: 'from-[#CB5910]/10 to-[#CB5910]/5', route: '/analiticas' },
                { label: 'Configuración', icon: Settings, color: '#6B7280', bgGradient: 'from-gray-500/10 to-gray-500/5', route: '/configuracion' },
                { label: 'Historial', icon: ClipboardList, color: '#8B5CF6', bgGradient: 'from-purple-500/10 to-purple-500/5', route: '/historial' },
                { label: 'Notificaciones', icon: Bell, color: '#FF3B30', bgGradient: 'from-red-500/10 to-red-500/5', route: '/notificaciones' },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.route)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-3 p-4 h-24 
                    rounded-2xl transition-all duration-300 ease-out overflow-hidden
                    hover:scale-105 active:scale-95 
                    bg-gradient-to-br ${action.bgGradient}
                    border border-white/40 hover:border-white/60
                    shadow-lg hover:shadow-xl
                  `}
                  style={{
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  }}
                >
                  {/* Efecto de brillo superior */}
                  <div 
                    className="absolute top-0 left-4 right-4 h-px opacity-40"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
                    }}
                  />
                  
                  {/* Gradiente de hover sutil */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at center, ${action.color}15 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Contenedor del icono con glassmorphismo */}
                  <div 
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-90"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                      border: `1px solid ${action.color}30`,
                      boxShadow: `0 4px 12px ${action.color}20`
                    }}
                  >
                    {/* Brillo interno del contenedor del icono */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-40"
                      style={{ 
                        background: `linear-gradient(135deg, ${action.color}30 0%, transparent 60%)`
                      }}
                    />
                    
                    <action.icon 
                      size={18} 
                      className="relative z-10 transition-all duration-300"
                      style={{ 
                        color: action.color,
                        filter: `drop-shadow(0 1px 2px ${action.color}40)`
                      }}
                    />
                  </div>
                  
                  {/* Texto mejorado */}
                  <span 
                    className="text-xs font-semibold text-center leading-tight relative z-10 transition-all duration-300 group-hover:opacity-90"
                    style={{ color: action.color }}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </IOSCardContent>
        </IOSCard>
      </section>

      {/* Grid principal optimizado para tablet landscape y mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Panel principal - optimizado para diferentes dispositivos */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Upcoming Reservations */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="flex items-center ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900">
                Reservas de Hoy
              </IOSCardTitle>
              <div className="flex items-center justify-between sm:justify-end space-x-2">
                <IOSBadge variant="custom" className="bg-enigma-primary text-white px-2 sm:px-3 py-1 text-xs font-semibold">
                  {upcomingReservations.length} activas
                </IOSBadge>
                <span className="text-xs text-enigma-neutral-500">
                  🕓 {format(getSpainDate(), 'HH:mm')}
                </span>
              </div>
            </IOSCardHeader>
            
            <IOSCardContent className="p-0">
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8 px-6 text-enigma-neutral-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay reservas activas para hoy</p>
                  <p className="ios-text-footnote mt-1">Próxima actualización: {format(addHours(getSpainDate(), 1), 'HH:mm')}</p>
                </div>
              ) : (
                <div className="max-h-80 sm:max-h-96 lg:max-h-[32rem] overflow-y-auto">
                  {upcomingReservations.map((reservation, index) => (
                    <div key={reservation.id} 
                         onClick={() => handleReservationClick(reservation)}
                         className={`
                           group relative bg-white hover:bg-enigma-neutral-50 
                           border-b border-enigma-neutral-200 last:border-b-0
                           ios-touch-feedback cursor-pointer transition-all duration-200
                           hover:shadow-md active:bg-enigma-neutral-100
                           ${index === 0 ? 'rounded-t-ios-lg' : ''}
                           ${index === upcomingReservations.length - 1 ? 'rounded-b-ios-lg' : ''}
                         `}>
                      
                      {/* Layout vertical expandido para mostrar notas */}
                      <div className="p-4">
                        
                        {/* Primera fila: Hora, cliente y estado - Layout responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          
                          {/* Fila superior en móvil: Hora y estado */}
                          <div className="flex items-center justify-between sm:hidden">
                            {/* Hora destacada móvil */}
                            <div className="bg-enigma-primary text-white px-3 py-1.5 rounded-ios-lg shadow-ios-sm">
                              <div className="flex items-center space-x-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-bold text-sm">{formatReservationTime(reservation.hora_reserva)}</span>
                              </div>
                            </div>
                            
                            {/* Estado móvil */}
                            <div 
                              className="text-white px-2.5 py-1.5 rounded-ios text-xs font-semibold uppercase shadow-ios-sm"
                              style={{ backgroundColor: getStatusColor(reservation.estado || '') }}
                            >
                              {getStatusLabel(reservation.estado || '')}
                            </div>
                          </div>

                          {/* Layout desktop: Lado izquierdo */}
                          <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:flex-1 sm:min-w-0">
                            {/* Hora destacada desktop */}
                            <div className="flex-shrink-0">
                              <div className="bg-enigma-primary text-white px-4 py-2 rounded-ios-lg shadow-ios-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-bold text-base">{formatReservationTime(reservation.hora_reserva)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Info del cliente desktop */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <User className="h-4 w-4 text-enigma-neutral-600 flex-shrink-0" />
                                <h4 className="font-semibold text-enigma-neutral-900 truncate">
                                  {reservation.cliente?.nombre ? 
                                    `${reservation.cliente.nombre} ${reservation.cliente.apellidos || ''}`.trim() : 
                                    reservation.nombre_reserva
                                  }
                                </h4>
                                {reservation.cliente?.es_vip && (
                                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-1 rounded-ios text-xs font-semibold flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>VIP</span>
                                  </div>
                                )}
                                {reservation.es_primera_visita && (
                                  <div className="bg-enigma-accent text-white px-2 py-1 rounded-ios text-xs font-semibold flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>Primera vez</span>
                                  </div>
                                )}
                              </div>
                              {/* Mostrar mesa asignada si existe */}
                              {reservation.mesa_id && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <MapPin className="h-3 w-3 text-enigma-primary" />
                                  <span className="text-xs text-enigma-primary font-semibold">
                                    Mesa: {reservation.mesa?.numero_mesa && reservation.mesa?.zona_id ? 
                                      getTableDisplayNameFromData(reservation.mesa.numero_mesa, reservation.mesa.zona_id) : 
                                      `Mesa ${reservation.mesa_id}`}
                                  </span>
                                  {reservation.mesa?.zona?.nombre && (
                                    <span className="text-xs text-enigma-neutral-500">
                                      • {reservation.mesa.zona.nombre}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Info del cliente móvil */}
                          <div className="sm:hidden">
                            <div className="flex items-start space-x-2">
                              <User className="h-4 w-4 text-enigma-neutral-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-enigma-neutral-900 truncate text-sm leading-tight">
                                  {reservation.cliente?.nombre ? 
                                    `${reservation.cliente.nombre} ${reservation.cliente.apellidos || ''}`.trim() : 
                                    reservation.nombre_reserva
                                  }
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {reservation.cliente?.es_vip && (
                                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-0.5 rounded-ios text-xs font-semibold flex items-center space-x-1">
                                      <Star className="h-2.5 w-2.5" />
                                      <span>VIP</span>
                                    </div>
                                  )}
                                  {reservation.es_primera_visita && (
                                    <div className="bg-enigma-accent text-white px-2 py-0.5 rounded-ios text-xs font-semibold flex items-center space-x-1">
                                      <Star className="h-2.5 w-2.5" />
                                      <span>Primera vez</span>
                                    </div>
                                  )}
                                </div>
                                {/* Mesa móvil */}
                                {reservation.mesa_id && (
                                  <div className="flex items-center space-x-1 mt-1.5">
                                    <MapPin className="h-3 w-3 text-enigma-primary" />
                                    <span className="text-xs text-enigma-primary font-semibold">
                                      Mesa: {reservation.mesa?.numero_mesa && reservation.mesa?.zona_id ? 
                                        getTableDisplayNameFromData(reservation.mesa.numero_mesa, reservation.mesa.zona_id) : 
                                        `Mesa ${reservation.mesa_id}`}
                                    </span>
                                    {reservation.mesa?.zona?.nombre && (
                                      <span className="text-xs text-enigma-neutral-500 truncate">
                                        • {reservation.mesa.zona.nombre}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Estado desktop */}
                          <div className="hidden sm:block sm:flex-shrink-0">
                            <div 
                              className="text-white px-3 py-2 rounded-ios text-sm font-semibold uppercase shadow-ios-sm min-w-[90px] text-center"
                              style={{ backgroundColor: getStatusColor(reservation.estado || '') }}
                            >
                              {getStatusLabel(reservation.estado || '')}
                            </div>
                          </div>
                        </div>

                        {/* Segunda fila: Detalles de contacto y acciones - Layout responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          
                          {/* Detalles de contacto - Stack en móvil, horizontal en desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-enigma-neutral-600 flex-1">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-enigma-primary" />
                              <span className="font-medium">{reservation.numero_personas} {reservation.numero_personas === 1 ? 'persona' : 'personas'}</span>
                            </div>
                            
                            {reservation.ocasion_especial && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-enigma-accent" />
                                <span className="truncate text-enigma-accent font-medium">{reservation.ocasion_especial}</span>
                              </div>
                            )}
                            
                            {(reservation.cliente?.telefono || reservation.telefono_reserva) && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-enigma-primary" />
                                <span className="truncate">{reservation.cliente?.telefono || reservation.telefono_reserva}</span>
                              </div>
                            )}
                            
                            {reservation.peticiones_especiales && (
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3 text-enigma-secondary" />
                                <span className="truncate text-enigma-secondary">Notas especiales</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Acciones rápidas - Stack en móvil */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-2 sm:flex-shrink-0">
                            {/* WhatsApp si tiene teléfono */}
                            {(reservation.cliente?.telefono || reservation.telefono_reserva) && (
                              <IOSButton
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppClick(reservation.cliente?.telefono || reservation.telefono_reserva);
                                }}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 p-2"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </IOSButton>
                            )}
                            
                            {reservation.estado === 'pendiente' && (
                              <IOSButton
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleStatusUpdate(reservation.id, 'confirmada', e)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-2 sm:px-3 py-1.5"
                                disabled={updateReservationMutation.isPending || isConfirming}
                              >
                                <Check className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline text-xs">
                                  {isConfirming ? 'Enviando...' : 'Confirmar y Enviar Email'}
                                </span>
                                <span className="sm:hidden text-xs">
                                  {isConfirming ? '...' : 'Confirmar'}
                                </span>
                              </IOSButton>
                            )}
                            
                            <IOSButton
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReservationClick(reservation);
                              }}
                              className="bg-enigma-primary/10 border-enigma-primary/20 text-enigma-primary hover:bg-enigma-primary/20 px-2 sm:px-3 py-1.5"
                            >
                              <Eye className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline text-xs">Detalles</span>
                            </IOSButton>
                          </div>
                        </div>
                        
                        {/* Notas visibles - Responsive */}
                        {reservation.peticiones_especiales && (
                          <div className="mt-3 p-3 bg-enigma-neutral-50 rounded-ios border border-enigma-neutral-200">
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 text-enigma-primary flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                  <span className="text-sm font-medium text-enigma-primary flex-shrink-0">Peticiones especiales:</span>
                                  <span className="text-sm text-enigma-neutral-700 break-words">{reservation.peticiones_especiales}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Barra de progreso sutil en la parte inferior */}
                      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-enigma-neutral-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </IOSCardContent>
          </IOSCard>

          {/* Modal para ficha completa de reserva */}
          <ReservationDetailModal
            reservationId={selectedReservation?.id || null}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onNavigateToClient={(clientId) => {
              setIsModalOpen(false);
              // Navegar a la página de clientes con el ID específico
              navigate(`/clientes?clientId=${clientId}`);
            }}
          />

          {/* Recent Activity */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900">Actividad Reciente</IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-enigma-neutral-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay actividad reciente</p>
                  <p className="ios-text-footnote mt-1">Las últimas acciones aparecerán aquí</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} 
                       className="flex items-center p-2.5 sm:p-3 bg-enigma-neutral-50 rounded-ios transition-all border border-enigma-neutral-200">
                    <div 
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0"
                      style={{
                        backgroundColor: 
                          activity.type === 'success' ? '#9FB289' :  // enigma-secondary
                          activity.type === 'warning' ? '#CB5910' :  // enigma-accent
                          activity.type === 'error' ? '#FF3B30' : '#237584'  // enigma-primary
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="ios-text-caption1 sm:ios-text-footnote text-enigma-neutral-900 font-medium mb-1 truncate">
                        {activity.action}
                      </div>
                      <div className="ios-text-caption2 sm:ios-text-caption1 text-enigma-neutral-500">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))
              )}

              <IOSButton 
                variant="outline" 
                className="w-full mt-4 border-enigma-primary text-enigma-primary hover:bg-enigma-primary hover:text-white"
                onClick={() => navigate('/historial')}
              >
                Ver Todo el Historial
              </IOSButton>
            </IOSCardContent>
          </IOSCard>

          {/* Resumen del Día */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-4 sm:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900 flex items-center">
                <Activity className="mr-2" size={16} className="sm:w-5 sm:h-5" />
                Resumen del Día
              </IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2.5 sm:p-3 bg-enigma-primary/10 rounded-ios">
                  <div className="text-xl sm:text-2xl font-bold text-enigma-primary">
                    {completedReservations}
                  </div>
                  <div className="text-xs sm:text-sm text-enigma-neutral-600 font-medium">
                    Completadas
                  </div>
                </div>
                <div className="text-center p-2.5 sm:p-3 bg-enigma-secondary/10 rounded-ios">
                  <div className="text-xl sm:text-2xl font-bold text-enigma-secondary">
                    {activeReservations}
                  </div>
                  <div className="text-xs sm:text-sm text-enigma-neutral-600 font-medium">
                    Activas
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-enigma-neutral-200">
                <IOSButton 
                  variant="outline" 
                  className="w-full border-enigma-secondary text-enigma-secondary hover:bg-enigma-secondary hover:text-white"
                  onClick={() => navigate('/analiticas')}
                >
                  Ver Reportes Completos
                </IOSButton>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>

        {/* Panel lateral - optimizado para tablet landscape */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Widget del tiempo - responsive según dispositivo */}
          <WeatherWidget 
            className=""
            compact={true} // Modo compacto automático
            showForecast={false} // Sin forecast para ahorrar espacio vertical
            showComfort={true}
          />

          {/* Estado de mesas por zona */}
          <IOSCard variant="default" className="overflow-hidden bg-white rounded-ios-lg shadow-ios border border-enigma-neutral-200">
            <IOSCardHeader className="p-3 sm:p-4 lg:p-6 border-b border-enigma-neutral-200">
              <IOSCardTitle className="ios-text-callout sm:ios-text-headline font-semibold text-enigma-neutral-900 flex items-center">
                <MapPin className="mr-2" size={16} className="sm:w-5 sm:h-5" />
                Estado por Zona
              </IOSCardTitle>
            </IOSCardHeader>
            
            <IOSCardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
              {Object.entries(zoneOccupancy).length === 0 ? (
                <div className="text-center py-8 text-enigma-neutral-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="ios-text-callout">No hay datos de ocupación</p>
                </div>
              ) : (
                Object.entries(zoneOccupancy).map(([zone, data]) => (
                  <OccupancyCard
                    key={zone}
                    zone={zone}
                    data={data}
                    color={getZoneColor(zone)}
                  />
                ))
              )}

              <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-enigma-neutral-50 rounded-ios text-center border border-enigma-neutral-200">
                <div className="ios-text-title3 sm:ios-text-title2 font-bold text-enigma-neutral-900 mb-1">
                  {occupiedTables + reservedTables}/{totalTables}
                </div>
                <div className="ios-text-caption1 sm:ios-text-footnote text-enigma-neutral-500">
                  Mesas ocupadas en total
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>

        </div>
      </div>

    </div>
  );
}
