
import React from 'react';
import { useNotificationsDirect } from '@/hooks/useNotificationsDirect';
import { getNotificationIcon } from './NotificationIcons';
import type { NotificationRow, NotificationTypeRow } from '@/types/notifications';

interface NotificationItemProps {
  notification: NotificationRow;
  onClick: () => void;
  notificationTypes?: NotificationTypeRow[];
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  notificationTypes = []
}) => {
  const { markAsRead } = useNotificationsDirect();

  const getTypeInfo = () => {
    // Buscar en los tipos de notificación de la BD primero
    const dbType = notificationTypes.find(tipo => tipo.codigo === notification.tipo_codigo);
    
    if (dbType) {
      return {
        icon: getNotificationIcon(dbType.icono),
        color: dbType.color,
        label: dbType.nombre
      };
    }
    
    // Mapeo de fallback por tipo de código
    const fallbackMap: Record<string, { icon: string; color: string; label: string }> = {
      'reservation_new': {
        icon: 'Calendar',
        color: '#237584',
        label: 'Nueva Reserva'
      },
      'reservation_modified': {
        icon: 'Edit',
        color: '#CB5910',
        label: 'Reserva Modificada'
      },
      'reservation_reminder': {
        icon: 'Clock',
        color: '#9FB289',
        label: 'Recordatorio'
      },
      'customer_arrived': {
        icon: 'UserCheck',
        color: '#9FB289',
        label: 'Cliente Llegó'
      },
      'customer_vip': {
        icon: 'Star',
        color: '#CB5910',
        label: 'Cliente VIP'
      }
    };
    
    const typeInfo = fallbackMap[notification.tipo_codigo] || {
      icon: 'Bell',
      color: '#6B7280',
      label: 'Notificación'
    };
    
    return {
      icon: getNotificationIcon(typeInfo.icon),
      color: typeInfo.color,
      label: typeInfo.label
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

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return time.toLocaleDateString('es-ES');
  };

  const handleClick = () => {
    if (!notification.leida) {
      markAsRead(String(notification.id));
    }
    onClick();
  };

  const typeInfo = getTypeInfo();
  const IconComponent = typeInfo.icon;

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: notification.leida ? '#F8F9FA' : '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: `2px solid ${notification.leida ? '#F0F0F0' : typeInfo.color + '20'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = typeInfo.color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = notification.leida ? '#F0F0F0' : `${typeInfo.color}20`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {!notification.leida && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#FF3B30',
        }} />
      )}
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: typeInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0,
        }}>
          <IconComponent size={20} />
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#000000',
              margin: '0',
              flex: 1,
            }}>
              {notification.titulo}
            </h3>
            
            <div style={{
              display: 'inline-block',
              backgroundColor: getPriorityColor(notification.prioridad),
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              {notification.prioridad}
            </div>
          </div>
          
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: '0 0 12px 0',
            lineHeight: '1.5',
          }}>
            {notification.mensaje}
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: `${typeInfo.color}20`,
              color: typeInfo.color,
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {typeInfo.label}
            </div>
            
            <span style={{
              fontSize: '12px',
              color: '#8E8E93',
              fontWeight: '500',
            }}>
              {getRelativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
