import React, { useState } from 'react';
import { Bell, Plus, Send, AlertCircle } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { useNotificationsDirect } from '@/hooks/useNotificationsDirect';
import { toast } from 'sonner';

export function NotificationDemo() {
  const { refetch } = useNotificationsDirect(); // createNotification no disponible en el hook directo
  const [isCreating, setIsCreating] = useState(false);

  const demoNotifications = [
    {
      type_code: 'reservation_new',
      title: 'Nueva Reserva',
      message: 'Mesa para 6 personas hoy a las 21:00',
      priority: 'high' as const,
      data: { personas: 6, hora: '21:00' }
    },
    {
      type_code: 'customer_vip',
      title: 'Cliente VIP',
      message: 'Sr. Rodriguez ha llegado - Mesa 15',
      priority: 'high' as const,
      data: { cliente_nombre: 'Sr. Rodriguez', mesa: '15' }
    },
    {
      type_code: 'table_available',
      title: 'Mesa Disponible',
      message: 'Mesa 6 liberada por cancelación',
      priority: 'normal' as const,
      data: { mesa: '6' }
    },
    {
      type_code: 'system',
      title: 'Actualización del Sistema',
      message: 'Nuevas funciones disponibles en el panel',
      priority: 'low' as const,
      data: { version: '2.1.0' }
    },
    {
      type_code: 'backup',
      title: 'Respaldo Completado',
      message: 'Respaldo automático realizado exitosamente',
      priority: 'low' as const,
      data: { backup_size: '2.5GB' }
    }
  ];

  const handleCreateNotification = async (notification: typeof demoNotifications[0]) => {
    setIsCreating(true);
    try {
      // TODO: Implementar createNotification directamente en useNotificationsDirect
      toast.info('Funcionalidad de creación temporalmente deshabilitada');
      console.log('Demo notification would create:', notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al crear la notificación');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <IOSCard className="mb-6">
      <IOSCardHeader className="pb-4">
        <IOSCardTitle className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-ios-lg flex items-center justify-center"
            style={{ backgroundColor: '#23758420', color: '#237584' }}
          >
            <Bell size={20} />
          </div>
          <div>
            <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
              Demo de Notificaciones
            </h3>
            <p className="ios-text-caption1 text-enigma-neutral-600 font-normal">
              Crea notificaciones de prueba para testear el sistema
            </p>
          </div>
        </IOSCardTitle>
      </IOSCardHeader>

      <IOSCardContent className="space-y-4">
        <div className="grid gap-3">
          {demoNotifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-enigma-neutral-50 rounded-ios-lg border border-enigma-neutral-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="ios-text-callout font-semibold text-enigma-neutral-900">
                    {notification.title}
                  </h4>
                  <span 
                    className={`px-2 py-1 rounded-ios text-xs font-medium ${
                      notification.priority === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : notification.priority === 'normal'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {notification.priority}
                  </span>
                </div>
                <p className="ios-text-footnote text-enigma-neutral-700">
                  {notification.message}
                </p>
                <p className="ios-text-caption2 text-enigma-neutral-500 mt-1">
                  Tipo: {notification.type_code}
                </p>
              </div>
              
              <IOSButton
                size="sm"
                variant="primary"
                onClick={() => handleCreateNotification(notification)}
                disabled={isCreating}
                className="ml-4 text-white"
                style={{ 
                  backgroundColor: '#237584',
                  borderColor: '#237584'
                }}
              >
                <Send size={16} className="mr-1" />
                Crear
              </IOSButton>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-ios-lg border border-blue-200">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="ios-text-callout font-semibold text-blue-900 mb-1">
                Instrucciones de Prueba
              </h4>
              <ul className="ios-text-footnote text-blue-800 space-y-1">
                <li>• Haz clic en "Crear" para generar notificaciones de prueba</li>
                <li>• Verifica que aparezcan en el dropdown de la campanita</li>
                <li>• Comprueba que el contador se actualice correctamente</li>
                <li>• Navega a la página de notificaciones para ver todas</li>
                <li>• Prueba marcar como leídas individualmente o todas</li>
              </ul>
            </div>
          </div>
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}