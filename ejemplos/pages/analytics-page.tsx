// Ejemplo: Página de Analytics con Recharts + Datos Reales
// Patrón: Data Visualization + Real-time Updates + Performance Metrics + Export

'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock,
  Download,
  RefreshCw 
} from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos de analytics
interface RevenueData {
  date: string;
  revenue: number;
  reservations: number;
  average_party_size: number;
}

interface ZonePerformance {
  zona_nombre: string;
  total_reservations: number;
  total_revenue: number;
  occupancy_rate: number;
  avg_duration: number;
}

interface PeakHours {
  hour: string;
  reservations: number;
  revenue: number;
}

interface CustomerSegmentation {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface AnalyticsMetrics {
  total_revenue: number;
  total_reservations: number;
  avg_party_size: number;
  occupancy_rate: number;
  revenue_growth: number;
  reservation_growth: number;
  top_zone: string;
  peak_hour: string;
}

// Colores para gráficos siguiendo el tema Enigma
const COLORS = {
  primary: '#237584',     // Teal corporativo
  secondary: '#9FB289',   // Sage natural
  accent: '#CB5910',      // Naranja cálido
  success: '#22C55E',     // Verde
  warning: '#F59E0B',     // Amarillo
  danger: '#EF4444',      // Rojo
  neutral: '#6B7280'      // Gris
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.success,
  COLORS.warning,
  COLORS.danger
];

// Hook para obtener datos de analytics
function useAnalyticsData(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd')
      });

      const [
        metricsRes,
        revenueRes,
        zonesRes,
        peakHoursRes,
        segmentationRes
      ] = await Promise.all([
        fetch(`/api/analytics/metrics?${params}`),
        fetch(`/api/analytics/revenue?${params}`),
        fetch(`/api/analytics/zones?${params}`),
        fetch(`/api/analytics/peak-hours?${params}`),
        fetch(`/api/analytics/segmentation?${params}`)
      ]);

      const [metrics, revenue, zones, peakHours, segmentation] = await Promise.all([
        metricsRes.json(),
        revenueRes.json(),
        zonesRes.json(),
        peakHoursRes.json(),
        segmentationRes.json()
      ]);

      return {
        metrics: metrics.data as AnalyticsMetrics,
        revenue: revenue.data as RevenueData[],
        zones: zones.data as ZonePerformance[],
        peakHours: peakHours.data as PeakHours[],
        segmentation: segmentation.data as CustomerSegmentation[]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
  });
}

// Componente de métricas principales
function MetricsOverview({ metrics }: { metrics: AnalyticsMetrics }) {
  const metricCards = [
    {
      title: 'Ingresos Totales',
      value: `€${metrics.total_revenue.toLocaleString('es-ES')}`,
      change: metrics.revenue_growth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total Reservas',
      value: metrics.total_reservations.toLocaleString('es-ES'),
      change: metrics.reservation_growth,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Promedio Personas',
      value: metrics.avg_party_size.toFixed(1),
      change: 0, // Se podría calcular el cambio
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Ocupación',
      value: `${metrics.occupancy_rate.toFixed(1)}%`,
      change: 0,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.change !== 0 && (
              <p className="text-xs text-muted-foreground flex items-center">
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
                <span className="ml-1">vs período anterior</span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Gráfico de ingresos y reservas por día
function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Ingresos y Reservas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: es })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: es })}
              formatter={(value, name) => [
                name === 'revenue' ? `€${value}` : value,
                name === 'revenue' ? 'Ingresos' : 'Reservas'
              ]}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill={COLORS.primary}
              name="Ingresos (€)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="reservations"
              stroke={COLORS.accent}
              strokeWidth={3}
              name="Reservas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Análisis de rendimiento por zonas
function ZonePerformanceChart({ data }: { data: ZonePerformance[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Zonas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="zona_nombre"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                switch (name) {
                  case 'total_revenue': return [`€${value}`, 'Ingresos'];
                  case 'total_reservations': return [value, 'Reservas'];
                  case 'occupancy_rate': return [`${value}%`, 'Ocupación'];
                  default: return [value, name];
                }
              }}
            />
            <Legend />
            <Bar 
              dataKey="total_revenue" 
              fill={COLORS.primary} 
              name="Ingresos (€)"
            />
            <Bar 
              dataKey="total_reservations" 
              fill={COLORS.secondary} 
              name="Reservas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfico de horas pico
function PeakHoursChart({ data }: { data: PeakHours[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `€${value}` : value,
                name === 'revenue' ? 'Ingresos' : 'Reservas'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="reservations" 
              fill={COLORS.accent} 
              name="Reservas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Segmentación de clientes
function CustomerSegmentationChart({ data }: { data: CustomerSegmentation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segmentación de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ segment, percentage }) => `${segment} (${percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} clientes (€${props.payload.revenue})`,
                props.payload.segment
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Página principal de analytics
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data, isLoading, error, refetch } = useAnalyticsData(dateRange);

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        format
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los datos de analytics</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Análisis detallado de rendimiento y métricas del restaurante
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
              <Select defaultValue="30d">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => exportData('csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="mb-8">
          <MetricsOverview metrics={data.metrics} />
        </div>

        {/* Gráficos en tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="zones">Zonas</TabsTrigger>
            <TabsTrigger value="hours">Horarios</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueChart data={data.revenue} />
          </TabsContent>

          <TabsContent value="zones" className="space-y-6">
            <ZonePerformanceChart data={data.zones} />
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <PeakHoursChart data={data.peakHours} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerSegmentationChart data={data.segmentation} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}