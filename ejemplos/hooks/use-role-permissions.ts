// Ejemplo: Hook para Sistema de Permisos Basado en Roles
// Patrón: RBAC + RLS Integration + Dynamic Permissions + Caching

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './use-auth';

// Tipos para el sistema de permisos
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  conditions?: Record<string, any>;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  level: number;
  permissions: Permission[];
  inherits_from?: string[];
  is_active: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role_id: string;
  role: Role;
  assigned_at: string;
  assigned_by: string;
  context?: Record<string, any>; // Para permisos contextuales
}

interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

interface PermissionCache {
  [key: string]: {
    allowed: boolean;
    checkedAt: number;
    ttl: number;
  };
}

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configuración de permisos del sistema
const SYSTEM_PERMISSIONS = {
  // Gestión de reservas
  'reservations.create': { resource: 'reservations', action: 'create' as const },
  'reservations.read': { resource: 'reservations', action: 'read' as const },
  'reservations.update': { resource: 'reservations', action: 'update' as const },
  'reservations.delete': { resource: 'reservations', action: 'delete' as const },
  'reservations.assign_table': { resource: 'reservations', action: 'execute' as const },
  
  // Gestión de mesas
  'tables.read': { resource: 'tables', action: 'read' as const },
  'tables.update_state': { resource: 'tables', action: 'update' as const },
  'tables.combine': { resource: 'tables', action: 'execute' as const },
  'tables.configure': { resource: 'tables', action: 'update' as const },
  
  // Gestión de clientes
  'clients.create': { resource: 'clients', action: 'create' as const },
  'clients.read': { resource: 'clients', action: 'read' as const },
  'clients.update': { resource: 'clients', action: 'update' as const },
  'clients.delete': { resource: 'clients', action: 'delete' as const },
  
  // Administración
  'admin.users': { resource: 'admin', action: 'read' as const },
  'admin.config': { resource: 'admin', action: 'update' as const },
  'admin.security': { resource: 'admin', action: 'execute' as const },
  'admin.audit_logs': { resource: 'admin', action: 'read' as const },
  
  // Analytics
  'analytics.view': { resource: 'analytics', action: 'read' as const },
  'analytics.export': { resource: 'analytics', action: 'execute' as const },
  
  // Configuración
  'settings.restaurant': { resource: 'settings', action: 'update' as const },
  'settings.notifications': { resource: 'settings', action: 'update' as const }
} as const;

type SystemPermission = keyof typeof SYSTEM_PERMISSIONS;

/**
 * Hook para obtener roles del usuario actual
 */
function useUserRoles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(
            *,
            role_permissions(
              permission:permissions(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('role.is_active', true);
      
      if (error) throw error;
      
      return data as UserRole[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
  });
}

/**
 * Hook principal para manejo de permisos
 * 
 * @example
 * ```tsx
 * const { 
 *   hasPermission, 
 *   can, 
 *   cannot,
 *   isAdmin,
 *   userRoles,
 *   checkPermission 
 * } = useRolePermissions();
 * 
 * // Verificaciones simples
 * if (can('reservations.create')) {
 *   // Mostrar botón crear reserva
 * }
 * 
 * // Verificaciones con contexto
 * const canEditReservation = await checkPermission({
 *   resource: 'reservations',
 *   action: 'update',
 *   context: { reservationId: '123', ownerId: 'user456' }
 * });
 * ```
 */
export function useRolePermissions() {
  const { user } = useAuth();
  const { data: userRoles = [], isLoading } = useUserRoles();
  const queryClient = useQueryClient();
  
  const [permissionCache, setPermissionCache] = useState<PermissionCache>({});

  // Obtener todos los permisos del usuario
  const allPermissions = useMemo(() => {
    const permissions: Permission[] = [];
    
    userRoles.forEach(userRole => {
      if (userRole.role?.role_permissions) {
        userRole.role.role_permissions.forEach((rp: any) => {
          if (rp.permission) {
            permissions.push(rp.permission);
          }
        });
      }
    });
    
    return permissions;
  }, [userRoles]);

  // Verificar si el usuario es administrador
  const isAdmin = useMemo(() => {
    return userRoles.some(userRole => 
      userRole.role.name === 'admin' || userRole.role.level >= 100
    );
  }, [userRoles]);

  // Verificar si el usuario es gerente
  const isManager = useMemo(() => {
    return userRoles.some(userRole => 
      ['admin', 'gerente'].includes(userRole.role.name) || userRole.role.level >= 80
    );
  }, [userRoles]);

  // Obtener el rol de mayor nivel
  const primaryRole = useMemo(() => {
    return userRoles.reduce((highest, userRole) => {
      return !highest || userRole.role.level > highest.role.level ? userRole : highest;
    }, userRoles[0]);
  }, [userRoles]);

  // Función para verificar permisos simples (sin contexto)
  const hasSimplePermission = useCallback((
    resource: string,
    action: string
  ): boolean => {
    // Administradores tienen todos los permisos
    if (isAdmin) return true;
    
    // Buscar permiso específico
    return allPermissions.some(permission => 
      permission.resource === resource && 
      permission.action === action
    );
  }, [allPermissions, isAdmin]);

  // Función para verificar permisos del sistema predefinidos
  const can = useCallback((permission: SystemPermission): boolean => {
    const { resource, action } = SYSTEM_PERMISSIONS[permission];
    return hasSimplePermission(resource, action);
  }, [hasSimplePermission]);

  // Función inversa de can()
  const cannot = useCallback((permission: SystemPermission): boolean => {
    return !can(permission);
  }, [can]);

  // Función avanzada para verificar permisos con contexto
  const checkPermission = useCallback(async (
    check: PermissionCheck
  ): Promise<boolean> => {
    const { resource, action, context = {} } = check;
    
    // Crear clave de caché
    const cacheKey = `${resource}:${action}:${JSON.stringify(context)}`;
    const cached = permissionCache[cacheKey];
    
    // Verificar caché
    if (cached && Date.now() - cached.checkedAt < cached.ttl) {
      return cached.allowed;
    }

    // Administradores siempre pueden
    if (isAdmin) {
      setPermissionCache(prev => ({
        ...prev,
        [cacheKey]: {
          allowed: true,
          checkedAt: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutos
        }
      }));
      return true;
    }

    // Verificar permisos básicos primero
    const hasBasicPermission = hasSimplePermission(resource, action);
    if (!hasBasicPermission) {
      setPermissionCache(prev => ({
        ...prev,
        [cacheKey]: {
          allowed: false,
          checkedAt: Date.now(),
          ttl: 5 * 60 * 1000
        }
      }));
      return false;
    }

    // Verificar condiciones contextuales específicas
    let allowed = true;

    // Verificaciones específicas por recurso
    switch (resource) {
      case 'reservations':
        if (context.ownerId && context.ownerId !== user?.id && !isManager) {
          // Solo managers pueden editar reservas de otros usuarios
          allowed = false;
        }
        if (context.status === 'completed' && action === 'update' && !isManager) {
          // Solo managers pueden editar reservas completadas
          allowed = false;
        }
        break;
        
      case 'clients':
        if (context.segment === 'vip' && !isManager) {
          // Solo managers pueden gestionar clientes VIP
          allowed = false;
        }
        break;
        
      case 'tables':
        if (action === 'update' && context.combiningTables && !isManager) {
          // Solo managers pueden combinar mesas
          allowed = false;
        }
        break;
        
      case 'admin':
        // Recursos de admin requieren rol de administrador
        allowed = isAdmin;
        break;
    }

    // Si necesitamos verificación adicional en el servidor
    if (allowed && context.requireServerCheck) {
      try {
        const { data, error } = await supabase.rpc('check_user_permission', {
          p_user_id: user?.id,
          p_resource: resource,
          p_action: action,
          p_context: context
        });
        
        if (error) throw error;
        allowed = data;
      } catch (error) {
        console.error('Permission check failed:', error);
        allowed = false;
      }
    }

    // Guardar en caché
    setPermissionCache(prev => ({
      ...prev,
      [cacheKey]: {
        allowed,
        checkedAt: Date.now(),
        ttl: context.requireServerCheck ? 60 * 1000 : 5 * 60 * 1000 // 1 min vs 5 min
      }
    }));

    return allowed;
  }, [permissionCache, isAdmin, hasSimplePermission, isManager, user?.id]);

  // Función para verificar múltiples permisos
  const checkMultiplePermissions = useCallback(async (
    checks: PermissionCheck[]
  ): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    
    await Promise.all(
      checks.map(async (check, index) => {
        const key = `${check.resource}.${check.action}`;
        results[key] = await checkPermission(check);
      })
    );
    
    return results;
  }, [checkPermission]);

  // Función para limpiar caché de permisos
  const clearPermissionCache = useCallback(() => {
    setPermissionCache({});
  }, []);

  // Función para invalidar permisos cuando cambian roles
  const invalidatePermissions = useCallback(() => {
    clearPermissionCache();
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
  }, [clearPermissionCache, queryClient]);

  // Limpiar caché al cambiar usuario
  useEffect(() => {
    clearPermissionCache();
  }, [user?.id, clearPermissionCache]);

  // Hooks específicos para componentes
  const usePermissionGuard = useCallback((
    permission: SystemPermission,
    fallback?: React.ReactNode
  ) => {
    const hasAccess = can(permission);
    
    return {
      hasAccess,
      PermissionGate: ({ children }: { children: React.ReactNode }) => 
        hasAccess ? <>{children}</> : <>{fallback}</>,
    };
  }, [can]);

  return {
    // Estado
    userRoles,
    allPermissions,
    isLoading,
    
    // Información del usuario
    isAdmin,
    isManager,
    primaryRole,
    
    // Verificaciones de permisos
    hasPermission: hasSimplePermission,
    can,
    cannot,
    checkPermission,
    checkMultiplePermissions,
    
    // Utilidades
    clearPermissionCache,
    invalidatePermissions,
    usePermissionGuard,
    
    // Metadatos
    cacheSize: Object.keys(permissionCache).length,
    permissionCache
  };
}

/**
 * Hook para componentes que requieren permisos específicos
 */
export function useRequiredPermissions(permissions: SystemPermission[]) {
  const { can, isLoading } = useRolePermissions();
  
  const hasAllPermissions = useMemo(() => {
    return permissions.every(permission => can(permission));
  }, [permissions, can]);
  
  const hasAnyPermission = useMemo(() => {
    return permissions.some(permission => can(permission));
  }, [permissions, can]);
  
  const missingPermissions = useMemo(() => {
    return permissions.filter(permission => !can(permission));
  }, [permissions, can]);
  
  return {
    hasAllPermissions,
    hasAnyPermission,
    missingPermissions,
    isLoading,
    canAccess: hasAllPermissions && !isLoading
  };
}

/**
 * Componente HOC para proteger rutas
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: SystemPermission[],
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    const { canAccess, isLoading } = useRequiredPermissions(requiredPermissions);
    
    if (isLoading) {
      return <div>Verificando permisos...</div>;
    }
    
    if (!canAccess) {
      return fallback || <div>No tienes permisos para acceder a esta sección.</div>;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook para verificaciones específicas de reservas
 */
export function useReservationPermissions() {
  const { checkPermission, can } = useRolePermissions();
  
  const canCreateReservation = can('reservations.create');
  const canViewReservations = can('reservations.read');
  
  const canEditReservation = useCallback(async (reservationId: string, ownerId?: string) => {
    return checkPermission({
      resource: 'reservations',
      action: 'update',
      context: { reservationId, ownerId }
    });
  }, [checkPermission]);
  
  const canDeleteReservation = useCallback(async (reservationId: string, status?: string) => {
    return checkPermission({
      resource: 'reservations',
      action: 'delete',
      context: { reservationId, status }
    });
  }, [checkPermission]);
  
  return {
    canCreateReservation,
    canViewReservations,
    canEditReservation,
    canDeleteReservation
  };
}