// Ejemplo: Dashboard con Server Components + Client Components
// Patrón: App Router + Server/Client Boundaries + Real-time Analytics + Streaming

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RealtimeStatsWidget } from './components/realtime-stats-widget';
import { QuickActionsPanel } from './components/quick-actions-panel';
import { TodayScheduleWidget } from './components/today-schedule-widget';

// Metadata estática para SEO
export const metadata: Metadata = {
  title: 'Dashboard - Enigma Reservas',
  description: 'Panel de control principal para gestión de reservas y mesas',
  robots: 'noindex', // Dashboard privado
};

// Tipos para los datos del dashboard
interface DashboardStats {
  today_reservations: number;
  active_tables: number;
  revenue_today: number;
  occupancy_rate: number;
  pending_reservations: number;
  vip_clients: number;
}

interface RecentActivity {
  id: number;
  type: 'reservation_created' | 'table_assigned' | 'client_seated' | 'payment_completed';
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

// Server Component para obtener datos iniciales
async function DashboardStats() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // Obtener estadísticas del día usando RPC function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats', {
        target_date: new Date().toISOString().split('T')[0]
      });

    if (statsError) throw statsError;

    // Obtener actividad reciente con JOIN optimizado
    const { data: activities, error: activitiesError } = await supabase
      .from('audit_log')
      .select(`
        id,
        action_type,
        description,
        created_at,
        priority,
        empleado:personal.empleados(nombre)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) throw activitiesError;

    return { stats: stats[0] as DashboardStats, activities: activities as RecentActivity[] };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Graceful fallback con datos mock
    return {
      stats: {
        today_reservations: 0,
        active_tables: 0,
        revenue_today: 0,
        occupancy_rate: 0,
        pending_reservations: 0,
        vip_clients: 0
      } as DashboardStats,
      activities: [] as RecentActivity[]
    };
  }
}

// Componente para mostrar métricas principales
function StatsGrid({ stats }: { stats: DashboardStats }) {
  const metrics = [
    {
      title: 'Reservas Hoy',
      value: stats.today_reservations,
      icon: Calendar,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Mesas Activas',
      value: stats.active_tables,
      icon: Users,
      trend: `${stats.occupancy_rate}%`,
      color: 'text-green-600'
    },
    {
      title: 'Ingresos Hoy',
      value: `€${stats.revenue_today}`,
      icon: DollarSign,
      trend: '+8%',
      color: 'text-purple-600'
    },
    {
      title: 'Pendientes',
      value: stats.pending_reservations,
      icon: TrendingUp,
      trend: '-3%',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{metric.trend}</span> desde ayer
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente para actividad reciente
function RecentActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(activity.priority)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeletons para Suspense
function DashboardStatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentActivityLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-2 h-2 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Página principal del Dashboard (Server Component)
export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Enigma Cocina con Alma
            </h1>
            <p className="mt-2 text-gray-600">
              Panel de control para gestión de reservas y operaciones diarias
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Estadísticas principales con Suspense */}
          <Suspense fallback={<DashboardStatsLoading />}>
            <DashboardStatsContainer />
          </Suspense>

          {/* Layout de 3 columnas para widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Actividad reciente */}
            <div className="lg:col-span-1">
              <Suspense fallback={<RecentActivityLoading />}>
                <RecentActivityContainer />
              </Suspense>
            </div>

            {/* Columna central - Horario del día */}
            <div className="lg:col-span-1">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <TodayScheduleWidget />
              </Suspense>
            </div>

            {/* Columna derecha - Acciones rápidas y stats en tiempo real */}
            <div className="lg:col-span-1 space-y-6">
              <QuickActionsPanel />
              <RealtimeStatsWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Containers para Suspense boundaries
async function DashboardStatsContainer() {
  const { stats } = await DashboardStats();
  return <StatsGrid stats={stats} />;
}

async function RecentActivityContainer() {
  const { activities } = await DashboardStats();
  return <RecentActivityFeed activities={activities} />;
}