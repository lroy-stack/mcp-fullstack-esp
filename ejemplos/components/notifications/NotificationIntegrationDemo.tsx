import React, { useState } from 'react';
import { Bell, Calendar, Users, Settings, Zap } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { useNotificationEmitter } from '@/hooks/useNotificationEmitter';
import { useNotificationSystem } from './NotificationSystemProvider';
import { toast } from 'sonner';

export function NotificationIntegrationDemo() {
  const { emitReservaEvent, emitClienteEvent, emitMesaEvent } = useNotificationEmitter();
  const { emitConfigurationChange } = useNotificationSystem();
  const [isEmitting, setIsEmitting] = useState(false);

  const handleEventDemo = async (eventType: string) => {
    setIsEmitting(true);
    try {
      switch (eventType) {
        case 'reserva_proxima_15min':
          await emitReservaEvent('reserva_proxima_15min', {
            id: 'demo-reserva-1',
            nombre: 'Carlos Rodríguez',
            fecha_reserva: new Date().toISOString().split('T')[0],
            hora_reserva: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            personas: 4,
            mesa: '12'
          });
          toast.success('Notificación de reserva próxima emitida');
          break;

        case 'cliente_vip_reserva':
          await emitClienteEvent('cliente_vip_reserva', {
            id: 'demo-cliente-1',
            name: 'María',
            last_name: 'García',
            vip_status: true,
            preferencias_comida: 'Sin gluten'
          });
          toast.success('Notificación de cliente VIP emitida');
          break;

        case 'mesa_tiempo_limite_100':
          await emitMesaEvent('mesa_tiempo_limite_100', {
            id: 'demo-mesa-1',
            numero_mesa: '8',
            capacidad: 4
          }, {
            tiempo_excedido: '15 minutos',
            siguiente_reserva: '21:30'
          });
          toast.success('Notificación de tiempo excedido emitida');
          break;

        case 'config_hours':
          await emitConfigurationChange('hours', {
            horario_anterior: '12:00-23:00',
            horario_nuevo: '11:30-23:30',
            fecha_efectiva: new Date().toISOString().split('T')[0]
          });
          toast.success('Notificación de cambio de horarios emitida');
          break;

        default:
          toast.error('Tipo de evento no reconocido');
      }
    } catch (error) {
      console.error('Error emitiendo evento:', error);
      toast.error('Error al emitir notificación');
    } finally {
      setIsEmitting(false);
    }
  };

  const demoEvents = [
    {
      id: 'reserva_proxima_15min',
      title: 'Reserva Próxima (15 min)',
      description: 'Cliente llega en 15 minutos',
      icon: Calendar,
      color: '#CB5910',
      category: 'Reservas'
    },
    {
      id: 'cliente_vip_reserva', 
      title: 'Cliente VIP',
      description: 'Cliente VIP con reserva',
      icon: Users,
      color: '#9FB289',
      category: 'Clientes'
    },
    {
      id: 'mesa_tiempo_limite_100',
      title: 'Mesa Tiempo Excedido',
      description: 'Mesa excede tiempo asignado',
      icon: Bell,
      color: '#CB5910',
      category: 'Mesas'
    },
    {
      id: 'config_hours',
      title: 'Cambio de Horarios',
      description: 'Horarios de operación modificados',
      icon: Settings,
      color: '#237584',
      category: 'Configuración'
    }
  ];

  return (
    <IOSCard className="mb-6">
      <IOSCardHeader className="pb-4">
        <IOSCardTitle className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-ios-lg flex items-center justify-center"
            style={{ backgroundColor: '#9FB28920', color: '#9FB289' }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
              Demo de Eventos Integrados
            </h3>
            <p className="ios-text-caption1 text-enigma-neutral-600 font-normal">
              Simula eventos automáticos del sistema de gestión
            </p>
          </div>
        </IOSCardTitle>
      </IOSCardHeader>

      <IOSCardContent className="space-y-6">
        {/* Grid de eventos por categoría */}
        <div className="grid gap-4">
          {['Reservas', 'Clientes', 'Mesas', 'Configuración'].map((category) => (
            <div key={category} className="space-y-3">
              <h4 className="ios-text-callout font-semibold text-enigma-neutral-700 border-b border-enigma-neutral-200 pb-2">
                {category}
              </h4>
              <div className="grid gap-3">
                {demoEvents
                  .filter(event => event.category === category)
                  .map((event) => {
                    const IconComponent = event.icon;
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-enigma-neutral-50 rounded-ios-lg border border-enigma-neutral-200 hover:bg-enigma-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-ios flex items-center justify-center"
                            style={{ backgroundColor: `${event.color}20`, color: event.color }}
                          >
                            <IconComponent size={18} />
                          </div>
                          <div className="flex-1">
                            <h5 className="ios-text-callout font-semibold text-enigma-neutral-900">
                              {event.title}
                            </h5>
                            <p className="ios-text-footnote text-enigma-neutral-700">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        
                        <IOSButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleEventDemo(event.id)}
                          disabled={isEmitting}
                          className="text-white"
                          style={{ 
                            backgroundColor: event.color,
                            borderColor: event.color
                          }}
                        >
                          {isEmitting ? 'Enviando...' : 'Simular'}
                        </IOSButton>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Información del sistema */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-ios-lg border border-blue-200">
          <div className="flex gap-3">
            <Zap size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="ios-text-callout font-semibold text-blue-900 mb-2">
                Sistema de Eventos Automático
              </h4>
              <div className="ios-text-footnote text-blue-800 space-y-1">
                <p>• <strong>Eventos de DB:</strong> Se disparan automáticamente con triggers SQL</p>
                <p>• <strong>Eventos de App:</strong> Se emiten desde hooks y componentes React</p>
                <p>• <strong>Eventos de Tiempo:</strong> Verificación cada 60 segundos para reservas próximas</p>
                <p>• <strong>Integración Completa:</strong> QueryClient detecta cambios y emite notificaciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status del sistema */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-ios-lg text-center">
            <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="ios-text-caption1 font-semibold text-green-800">Sistema Activo</p>
            <p className="ios-text-caption2 text-green-600">Escuchando eventos</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-ios-lg text-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2"></div>
            <p className="ios-text-caption1 font-semibold text-blue-800">52 Tipos de Eventos</p>
            <p className="ios-text-caption2 text-blue-600">Configurados y listos</p>
          </div>
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}