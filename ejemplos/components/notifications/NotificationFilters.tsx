
import React from 'react';
import type { NotificationType, Notification } from '@/hooks/useNotifications';

interface NotificationFiltersProps {
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationTypes: NotificationType[];
  notifications: Notification[];
  unreadCount: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  notificationTypes,
  notifications,
  unreadCount
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <input
          type="text"
          placeholder="Buscar por título, mensaje o cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid #E5E5EA',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#237584';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E5E5EA';
          }}
        />
      </div>
      
      <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '12px', padding: '4px' }}>
        {[
          { key: 'all', label: 'Todas', count: notifications.length },
          { key: 'unread', label: 'Sin Leer', count: unreadCount },
          { key: 'read', label: 'Leídas', count: notifications.length - unreadCount },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterStatus === filter.key ? '#237584' : 'transparent',
              color: filterStatus === filter.key ? '#FFFFFF' : '#000000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {filter.label}
            <span style={{
              backgroundColor: filterStatus === filter.key ? '#FFFFFF20' : '#23758420',
              color: filterStatus === filter.key ? '#FFFFFF' : '#237584',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        style={{
          padding: '12px',
          borderRadius: '12px',
          border: '2px solid #E5E5EA',
          fontSize: '14px',
          fontWeight: '600',
          backgroundColor: '#FFFFFF',
          cursor: 'pointer',
        }}
      >
        <option value="all">Todos los tipos</option>
        {notificationTypes.map((type) => (
          <option key={type.code} value={type.code}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
};
