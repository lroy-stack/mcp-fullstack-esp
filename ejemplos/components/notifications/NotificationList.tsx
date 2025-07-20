
import React from 'react';
import { NotificationItem } from './NotificationItem';
import { Bell } from 'lucide-react';
import type { NotificationRow, NotificationTypeRow } from '@/types/notifications';

interface NotificationListProps {
  notifications: NotificationRow[];
  notificationTypes?: NotificationTypeRow[];
  onNotificationClick: (notification: NotificationRow) => void;
  loading?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  notificationTypes = [],
  onNotificationClick,
  loading = false
}) => {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #F0F0F0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#000000',
          margin: '0',
        }}>
          Notificaciones
        </h2>
        <span style={{
          color: '#6B7280',
          fontSize: '14px',
        }}>
          {notifications.length} notificaciones mostradas
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #237584',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px auto',
            }} />
            <p className="text-sm">Cargando...</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              notificationTypes={notificationTypes}
              onClick={() => onNotificationClick(notification)}
            />
          ))
        )}
      </div>

      {!loading && notifications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6B7280',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <Bell size={48} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            No hay notificaciones
          </h3>
          <p style={{ fontSize: '14px', margin: '0' }}>
            No se encontraron notificaciones que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}
      </div>
    </>
  );
};
