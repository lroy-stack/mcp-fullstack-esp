
import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotificationIcon } from './NotificationIcons';
import type { NotificationRow, NotificationTypeRow } from '@/types/notifications';

interface NotificationModalProps {
  notification: NotificationRow | null;
  notificationTypes?: NotificationTypeRow[];
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  notificationTypes = [],
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  
  if (!isOpen || !notification) return null;

  const getTypeInfo = () => {
    // Buscar en los tipos de notificación el tipo actual
    const typeData = notificationTypes.find(tipo => tipo.codigo === notification.tipo_codigo);
    
    if (typeData) {
      return {
        icon: getNotificationIcon(typeData.icono || 'bell'),
        color: typeData.color || '#6B7280',
        label: typeData.nombre
      };
    }
    
    return {
      icon: getNotificationIcon('bell'),
      color: '#6B7280',
      label: 'Notificación'
    };
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#FF3B30';
      case 'normal': return '#237584';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getNavigationInfo = () => {
    if (notification.reserva_id) {
      return {
        path: '/reservas',
        label: 'Ver Reserva',
        description: 'Ir a la página de reservas para ver más detalles'
      };
    } else if (notification.cliente_id) {
      return {
        path: '/clientes',
        label: 'Ver Cliente',
        description: 'Ir a la página de clientes para ver más detalles'
      };
    } else if (notification.mesa_id) {
      return {
        path: '/mesas',
        label: 'Ver Mesa',
        description: 'Ir a la página de mesas para ver más detalles'
      };
    }
    return null;
  };

  const handleNavigate = () => {
    const navInfo = getNavigationInfo();
    if (navInfo) {
      navigate(navInfo.path);
      onClose();
    }
  };

  const typeInfo = getTypeInfo();
  const IconComponent = typeInfo.icon;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '0',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${typeInfo.color}15, ${typeInfo.color}05)`,
          padding: '32px',
          borderBottom: '1px solid #F0F0F0',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#8E8E93',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: typeInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}>
              <IconComponent size={32} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: typeInfo.color,
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                {typeInfo.label}
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#000000',
                margin: '0 0 8px 0',
              }}>
                {notification.titulo}
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: '0',
                lineHeight: '1.5',
              }}>
                {notification.mensaje}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          padding: '32px',
          overflowY: 'auto',
        }}>
          
          {/* Información Adicional */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#000000',
              margin: '0 0 16px 0',
            }}>
              Detalles
            </h3>
            
            <div style={{
              backgroundColor: '#F8F9FA',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontSize: '14px',
              }}>
                <div>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Timestamp:</span>
                  <div style={{ marginTop: '4px', color: '#000000' }}>
                    {new Date(notification.created_at).toLocaleString('es-ES')}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>Prioridad:</span>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      backgroundColor: getPriorityColor(notification.prioridad || 'normal'),
                      color: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {(notification.prioridad || 'normal').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos específicos */}
              {notification.datos && Object.keys(notification.datos).length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E5EA' }}>
                  {Object.entries(notification.datos).map(([key, value]) => (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      fontSize: '14px',
                    }}>
                      <span style={{ color: '#6B7280', fontWeight: '600', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span style={{ color: '#000000', fontWeight: '600' }}>
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #F0F0F0',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: '2px solid #8E8E93',
              backgroundColor: 'transparent',
              color: '#8E8E93',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Cerrar
          </button>
          
          {/* CTA de navegación inteligente */}
          {getNavigationInfo() && (
            <button
              onClick={handleNavigate}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#237584',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e6b7a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#237584';
              }}
            >
              <ExternalLink size={16} />
              {getNavigationInfo()?.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
