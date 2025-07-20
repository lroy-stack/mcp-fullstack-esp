// Ejemplo: Helpers de Autenticación Supabase
// Patrón: Auth Context + Server/Client Components + Session Management + Security

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClientComponentClient, type Session, type User } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/database';

// Tipos para el contexto de autenticación
interface AuthUser {
  id: string;
  email: string;
  role: string;
  employee: {
    id: number;
    nombre: string;
    rol: string;
    activo: boolean;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasMinimumRole: (minimumRole: string) => boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Jerarquía de roles para comparaciones
const ROLE_HIERARCHY = {
  'host': 1,
  'staff': 2, 
  'gerente': 3,
  'admin': 4
} as const;

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticación
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createClientComponentClient<Database>();

  /**
   * Obtener datos del empleado desde la base de datos
   */
  const fetchEmployeeData = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    try {
      const { data: employee, error } = await supabase
        .from('empleados')
        .select('id, nombre, rol, activo')
        .eq('email', authUser.email)
        .eq('activo', true)
        .single();

      if (error || !employee) {
        console.error('Error obteniendo datos de empleado:', error);
        return null;
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        role: employee.rol,
        employee
      };
    } catch (error) {
      console.error('Error en fetchEmployeeData:', error);
      return null;
    }
  }, [supabase]);

  /**
   * Actualizar estado del usuario
   */
  const updateUserState = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const authUser = await fetchEmployeeData(session.user);
      setUser(authUser);
    } else {
      setUser(null);
    }
    setSession(session);
    setIsLoading(false);
  }, [fetchEmployeeData]);

  /**
   * Inicializar autenticación
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        await updateUserState(initialSession);

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event);
            
            switch (event) {
              case 'SIGNED_IN':
                await updateUserState(session);
                break;
              case 'SIGNED_OUT':
                setUser(null);
                setSession(null);
                setIsLoading(false);
                router.push('/login');
                break;
              case 'TOKEN_REFRESHED':
                await updateUserState(session);
                break;
              case 'USER_UPDATED':
                if (session) {
                  await updateUserState(session);
                }
                break;
              default:
                await updateUserState(session);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error inicializando auth:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [supabase.auth, updateUserState, router]);

  /**
   * Función de login
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        return {
          success: false,
          error: getErrorMessage(error.message)
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Error inesperado durante el login'
        };
      }

      // Verificar que el usuario sea un empleado activo
      const employeeData = await fetchEmployeeData(data.user);
      
      if (!employeeData) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Usuario no autorizado para acceder al sistema'
        };
      }

      return {
        success: true,
        data: employeeData
      };

    } catch (error) {
      console.error('Error en signIn:', error);
      return {
        success: false,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth, fetchEmployeeData]);

  /**
   * Función de logout
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Limpiar estado local primero
      setUser(null);
      setSession(null);
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar cache del navegador
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

    } catch (error) {
      console.error('Error en signOut:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  /**
   * Resetear contraseña
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: getErrorMessage(error.message)
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Error en resetPassword:', error);
      return {
        success: false,
        error: 'Error enviando email de recuperación'
      };
    }
  }, [supabase.auth]);

  /**
   * Actualizar contraseña
   */
  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        return {
          success: false,
          error: getErrorMessage(error.message)
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Error en updatePassword:', error);
      return {
        success: false,
        error: 'Error actualizando contraseña'
      };
    }
  }, [supabase.auth]);

  /**
   * Refrescar sesión
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      await updateUserState(session);
    } catch (error) {
      console.error('Error refrescando sesión:', error);
    }
  }, [supabase.auth, updateUserState]);

  /**
   * Verificar si el usuario tiene rol específico
   */
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }, [user]);

  /**
   * Verificar si el usuario tiene rol mínimo requerido
   */
  const hasMinimumRole = useCallback((minimumRole: string): boolean => {
    if (!user) return false;
    
    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const minimumLevel = ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] || 0;
    
    return userLevel >= minimumLevel;
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    hasRole,
    hasMinimumRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

/**
 * Hook para proteger componentes que requieren autenticación
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook para proteger componentes que requieren roles específicos
 */
export function useRequireRole(
  requiredRoles: string | string[],
  redirectTo: string = '/dashboard'
) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  const hasRequiredRole = hasRole(requiredRoles);

  useEffect(() => {
    if (!isLoading && user && !hasRequiredRole) {
      router.push(redirectTo);
    }
  }, [user, isLoading, hasRequiredRole, router, redirectTo]);

  return { hasRequiredRole, isLoading };
}

/**
 * Componente HOC para proteger páginas
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string | string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }

        if (requiredRoles && !hasRole(requiredRoles)) {
          router.push('/dashboard');
          return;
        }
      }
    }, [isAuthenticated, isLoading, hasRole, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated || (requiredRoles && !hasRole(requiredRoles))) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Componente de guard para proteger rutas
 */
interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string | string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requiredRoles, 
  fallback,
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Funciones de utilidad
 */

// Convertir mensajes de error de Supabase a español
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Credenciales de acceso inválidas',
    'Email not confirmed': 'Email no confirmado',
    'User not found': 'Usuario no encontrado',
    'Invalid email': 'Email inválido',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'signup_disabled': 'Registro deshabilitado',
    'weak_password': 'Contraseña muy débil',
    'email_address_invalid': 'Dirección de email inválida'
  };

  return errorMessages[error] || 'Error de autenticación';
}

// Verificar si el usuario es administrador
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

// Verificar si el usuario es manager o admin
export function isManagerOrAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'gerente';
}

// Obtener permisos del usuario basado en rol
export function getUserPermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    'admin': [
      'users.read', 'users.write', 'users.delete',
      'reservations.read', 'reservations.write', 'reservations.delete',
      'clients.read', 'clients.write', 'clients.delete',
      'tables.read', 'tables.write', 'tables.delete',
      'analytics.read', 'analytics.export',
      'settings.read', 'settings.write'
    ],
    'gerente': [
      'reservations.read', 'reservations.write', 'reservations.delete',
      'clients.read', 'clients.write',
      'tables.read', 'tables.write',
      'analytics.read', 'analytics.export',
      'settings.read'
    ],
    'staff': [
      'reservations.read', 'reservations.write',
      'clients.read', 'clients.write',
      'tables.read', 'tables.write',
      'analytics.read'
    ],
    'host': [
      'reservations.read', 'reservations.write',
      'clients.read',
      'tables.read'
    ]
  };

  return permissions[role] || [];
}

// Verificar permiso específico
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  
  const userPermissions = getUserPermissions(user.role);
  return userPermissions.includes(permission);
}

/**
 * Helpers para Server Components
 */

// Para usar en Server Components (sin hooks)
export async function getServerUser() {
  // Esta función sería implementada usando cookies del servidor
  // y verificación con Supabase SSR
  return null;
}

// Constantes exportadas
export const AUTH_ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  STAFF: 'staff', 
  HOST: 'host'
} as const;

export const AUTH_PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  RESERVATIONS_READ: 'reservations.read',
  RESERVATIONS_WRITE: 'reservations.write',
  CLIENTS_READ: 'clients.read',
  CLIENTS_WRITE: 'clients.write',
  ANALYTICS_READ: 'analytics.read',
  SETTINGS_WRITE: 'settings.write'
} as const;