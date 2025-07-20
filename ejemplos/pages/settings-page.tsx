// Ejemplo: Página de Configuración con RLS Policies
// Patrón: Role-based Access + Configuration Management + Security + Audit Trail

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Users, 
  Database, 
  Clock, 
  Mail, 
  Bell,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Tipos para configuración del sistema
interface RestaurantConfig {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  capacidad_total: number;
  horario_apertura: string;
  horario_cierre: string;
  tiempo_turno_minutos: number;
  anticipacion_reserva_dias: number;
  politicas_cancelacion: string;
  configuracion_notificaciones: NotificationSettings;
  configuracion_email: EmailSettings;
  activo: boolean;
  updated_at: string;
}

interface NotificationSettings {
  reserva_nueva: boolean;
  reserva_confirmada: boolean;
  reserva_cancelada: boolean;
  mesa_liberada: boolean;
  recordatorio_cliente: boolean;
  sound_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  ssl_enabled: boolean;
  templates_customized: boolean;
}

interface SecurityPolicy {
  id: number;
  policy_name: string;
  table_name: string;
  role_required: string;
  policy_type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  policy_definition: string;
  enabled: boolean;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: string;
  user_name: string;
  action: string;
  table_affected: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  timestamp: string;
  ip_address: string;
}

// Hook para obtener configuración del restaurante
function useRestaurantConfig() {
  return useQuery({
    queryKey: ['restaurant-config'],
    queryFn: async () => {
      const response = await fetch('/api/config/restaurant');
      if (!response.ok) throw new Error('Error al cargar configuración');
      const data = await response.json();
      return data.config as RestaurantConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener políticas de seguridad RLS
function useSecurityPolicies() {
  return useQuery({
    queryKey: ['security-policies'],
    queryFn: async () => {
      const response = await fetch('/api/config/security/policies');
      if (!response.ok) throw new Error('Error al cargar políticas');
      const data = await response.json();
      return data.policies as SecurityPolicy[];
    }
  });
}

// Hook para obtener logs de auditoría
function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const response = await fetch(`/api/config/audit-logs?limit=${limit}`);
      if (!response.ok) throw new Error('Error al cargar logs');
      const data = await response.json();
      return data.logs as AuditLog[];
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
}

// Configuración básica del restaurante
function RestaurantBasicConfig() {
  const { data: config, isLoading } = useRestaurantConfig();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<RestaurantConfig>>({});

  const { mutate: updateConfig, isPending } = useMutation({
    mutationFn: async (updates: Partial<RestaurantConfig>) => {
      const response = await fetch('/api/config/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Error al actualizar configuración');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-config'] });
      toast({
        title: "Configuración Actualizada",
        description: "Los cambios se han guardado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  if (isLoading) {
    return <div className="animate-pulse">Cargando configuración...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración Básica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Restaurante</Label>
              <Input
                id="nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Enigma Cocina con Alma"
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+34 912 345 678"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Calle Justicia 6A, Madrid"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@enigmaconalma.com"
              />
            </div>

            <div>
              <Label htmlFor="capacidad_total">Capacidad Total</Label>
              <Input
                id="capacidad_total"
                type="number"
                value={formData.capacidad_total || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidad_total: parseInt(e.target.value) }))}
                placeholder="98"
              />
            </div>

            <div>
              <Label htmlFor="horario_apertura">Horario Apertura</Label>
              <Input
                id="horario_apertura"
                type="time"
                value={formData.horario_apertura || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_apertura: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="horario_cierre">Horario Cierre</Label>
              <Input
                id="horario_cierre"
                type="time"
                value={formData.horario_cierre || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_cierre: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="tiempo_turno_minutos">Duración Turno (minutos)</Label>
              <Select 
                value={formData.tiempo_turno_minutos?.toString() || '120'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tiempo_turno_minutos: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                  <SelectItem value="150">150 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="anticipacion_reserva_dias">Anticipación Reservas (días)</Label>
              <Input
                id="anticipacion_reserva_dias"
                type="number"
                value={formData.anticipacion_reserva_dias || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, anticipacion_reserva_dias: parseInt(e.target.value) }))}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="politicas_cancelacion">Políticas de Cancelación</Label>
            <Textarea
              id="politicas_cancelacion"
              value={formData.politicas_cancelacion || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, politicas_cancelacion: e.target.value }))}
              placeholder="Cancelación gratuita hasta 2 horas antes..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Configuración de notificaciones
function NotificationConfig() {
  const { data: config } = useRestaurantConfig();
  const [settings, setSettings] = useState<NotificationSettings>({
    reserva_nueva: true,
    reserva_confirmada: true,
    reserva_cancelada: true,
    mesa_liberada: false,
    recordatorio_cliente: true,
    sound_enabled: true,
    email_enabled: true,
    whatsapp_enabled: false
  });

  useEffect(() => {
    if (config?.configuracion_notificaciones) {
      setSettings(config.configuracion_notificaciones);
    }
  }, [config]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Eventos a Notificar</h4>
          
          {Object.entries(settings).slice(0, 5).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="text-sm capitalize">
                {key.replace('_', ' ').replace('reserva', 'Reserva').replace('mesa', 'Mesa')}
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Canales de Notificación</h4>
          
          {Object.entries(settings).slice(5).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="text-sm capitalize">
                {key.replace('_enabled', '').replace('_', ' ')}
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Políticas de seguridad RLS
function SecurityPoliciesConfig() {
  const { data: policies, isLoading } = useSecurityPolicies();
  const { user } = useAuth();

  // Solo administradores pueden ver políticas de seguridad
  if (user?.role !== 'admin') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Solo los administradores pueden acceder a la configuración de seguridad.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Políticas de Seguridad RLS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">Cargando políticas...</div>
        ) : (
          <div className="space-y-4">
            {policies?.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{policy.policy_name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                      {policy.enabled ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge variant="outline">
                      {policy.policy_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Tabla:</strong> {policy.table_name}</p>
                  <p><strong>Rol requerido:</strong> {policy.role_required}</p>
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">
                    Ver definición de política
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {policy.policy_definition}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Logs de auditoría
function AuditLogsConfig() {
  const { data: logs, isLoading } = useAuditLogs(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Logs de Auditoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">Cargando logs...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs?.map((log) => (
              <div key={log.id} className="border rounded p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{log.user_name}</span>
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="text-gray-600">
                  <p><strong>{log.action}</strong> en {log.table_affected}</p>
                  {log.ip_address && (
                    <p className="text-xs text-gray-500">IP: {log.ip_address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Página principal de configuración
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="mt-2 text-gray-600">
            Gestiona la configuración del restaurante, seguridad y notificaciones
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básica</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <RestaurantBasicConfig />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationConfig />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPoliciesConfig />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}