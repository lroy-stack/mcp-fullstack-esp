// Ejemplo: Middleware Next.js con Verificación de Roles
// Patrón: Auth Middleware + Role-based Access + Route Protection + Security

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Tipos para configuración de rutas
interface RouteConfig {
  path: string;
  roles: string[];
  publicAccess: boolean;
  redirect?: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
}

// Configuración de rutas protegidas
const ROUTE_CONFIGS: RouteConfig[] = [
  // Rutas públicas
  { path: '/', publicAccess: true, roles: [] },
  { path: '/login', publicAccess: true, roles: [] },
  { path: '/signup', publicAccess: true, roles: [] },
  { path: '/about', publicAccess: true, roles: [] },
  
  // Rutas que requieren autenticación básica
  { path: '/dashboard', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  { path: '/reservations', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  { path: '/tables', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  { path: '/clients', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  
  // Rutas que requieren permisos específicos
  { path: '/analytics', publicAccess: false, roles: ['staff', 'gerente', 'admin'] },
  { path: '/reports', publicAccess: false, roles: ['gerente', 'admin'] },
  { path: '/settings', publicAccess: false, roles: ['gerente', 'admin'] },
  { path: '/admin', publicAccess: false, roles: ['admin'], redirect: '/dashboard' },
  { path: '/users', publicAccess: false, roles: ['admin'], redirect: '/dashboard' },
  
  // API Routes
  { path: '/api/reservations', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  { path: '/api/clients', publicAccess: false, roles: ['host', 'staff', 'gerente', 'admin'] },
  { path: '/api/analytics', publicAccess: false, roles: ['staff', 'gerente', 'admin'] },
  { path: '/api/admin', publicAccess: false, roles: ['admin'] },
];

// Rutas que siempre deben ser públicas (no verificar auth)
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/api/webhook',
  '/_next',
  '/favicon.ico',
  '/static',
  '/images'
];

// Headers de seguridad
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Función principal del middleware
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Aplicar headers de seguridad a todas las respuestas
  applySecurityHeaders(response);

  // Skip verificación para rutas públicas
  if (isPublicPath(pathname)) {
    return response;
  }

  try {
    // Crear cliente Supabase para middleware
    const supabase = createMiddlewareClient<Database>({ req: request, res: response });

    // Obtener sesión del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error obteniendo sesión:', sessionError);
      return redirectToLogin(request);
    }

    // Si no hay sesión, verificar si la ruta requiere autenticación
    if (!session) {
      const routeConfig = getRouteConfig(pathname);
      if (routeConfig && !routeConfig.publicAccess) {
        return redirectToLogin(request, pathname);
      }
      return response;
    }

    // Obtener información del usuario con rol
    const authUser = await getUserWithRole(supabase, session.user.id);

    if (!authUser) {
      console.error('Usuario no encontrado en base de datos:', session.user.id);
      return redirectToLogin(request);
    }

    if (!authUser.isActive) {
      return createErrorResponse('Cuenta desactivada', 403);
    }

    // Verificar permisos para la ruta
    const hasAccess = await checkRouteAccess(pathname, authUser);

    if (!hasAccess) {
      const routeConfig = getRouteConfig(pathname);
      const redirectPath = routeConfig?.redirect || '/dashboard';
      
      // Log del intento de acceso no autorizado
      console.warn('Acceso denegado:', {
        user: authUser.email,
        role: authUser.role,
        path: pathname,
        timestamp: new Date().toISOString()
      });

      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Agregar información del usuario a los headers para las páginas
    response.headers.set('X-User-ID', authUser.id);
    response.headers.set('X-User-Role', authUser.role);
    response.headers.set('X-User-Email', authUser.email);

    // Rate limiting básico (en producción usar Redis o similar)
    const rateLimitResult = await checkRateLimit(request, authUser);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded', 429, {
        'Retry-After': rateLimitResult.retryAfter.toString(),
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      });
    }

    return response;

  } catch (error) {
    console.error('Error en middleware:', error);
    
    // En caso de error, permitir acceso pero logear
    console.error('Middleware error:', {
      path: pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return response;
  }
}

/**
 * Aplicar headers de seguridad
 */
function applySecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

/**
 * Verificar si una ruta es pública
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
}

/**
 * Obtener configuración de ruta
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  // Buscar coincidencia exacta primero
  let config = ROUTE_CONFIGS.find(route => route.path === pathname);
  
  // Si no hay coincidencia exacta, buscar por prefijo (para rutas dinámicas)
  if (!config) {
    config = ROUTE_CONFIGS.find(route => 
      pathname.startsWith(route.path + '/') || 
      (route.path !== '/' && pathname.startsWith(route.path))
    );
  }
  
  return config;
}

/**
 * Obtener usuario con rol desde la base de datos
 */
async function getUserWithRole(
  supabase: any, 
  userId: string
): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('id, nombre, email, rol, activo')
      .eq('email', (await supabase.auth.getUser()).data.user?.email)
      .eq('activo', true)
      .single();

    if (error || !data) {
      console.error('Error obteniendo datos de empleado:', error);
      return null;
    }

    return {
      id: userId,
      email: data.email,
      role: data.rol,
      isActive: data.activo
    };
  } catch (error) {
    console.error('Error en getUserWithRole:', error);
    return null;
  }
}

/**
 * Verificar acceso a ruta específica
 */
async function checkRouteAccess(pathname: string, user: AuthUser): Promise<boolean> {
  const routeConfig = getRouteConfig(pathname);
  
  // Si no hay configuración específica, permitir acceso por defecto
  if (!routeConfig) {
    return true;
  }

  // Si es ruta pública, permitir acceso
  if (routeConfig.publicAccess) {
    return true;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  return routeConfig.roles.includes(user.role);
}

/**
 * Rate limiting básico (en memoria, para producción usar Redis)
 */
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(
  request: NextRequest, 
  user: AuthUser
): Promise<{ allowed: boolean; limit: number; retryAfter: number; resetTime: number }> {
  const key = `${user.id}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const limit = user.role === 'admin' ? 200 : 100; // Más límite para admins
  
  const current = rateLimitCache.get(key);
  
  if (!current || now > current.resetTime) {
    // Nueva ventana de tiempo
    rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, limit, retryAfter: 0, resetTime: now + windowMs };
  }
  
  if (current.count >= limit) {
    // Límite excedido
    return { 
      allowed: false, 
      limit, 
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
      resetTime: current.resetTime
    };
  }
  
  // Incrementar contador
  current.count++;
  rateLimitCache.set(key, current);
  
  return { allowed: true, limit, retryAfter: 0, resetTime: current.resetTime };
}

/**
 * Redireccionar a login con URL de retorno
 */
function redirectToLogin(request: NextRequest, returnUrl?: string): NextResponse {
  const url = new URL('/login', request.url);
  
  if (returnUrl && returnUrl !== '/login') {
    url.searchParams.set('return', returnUrl);
  }
  
  const response = NextResponse.redirect(url);
  
  // Limpiar cookies de sesión si existen
  response.cookies.delete('supabase-auth-token');
  
  return response;
}

/**
 * Crear respuesta de error con headers apropiados
 */
function createErrorResponse(
  message: string, 
  status: number, 
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );
  
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Configuración del matcher para Next.js
 */
export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - api routes que empiezan con /api/auth/ (Supabase auth)
     * - archivos estáticos (_next/static)
     * - archivos de imagen (favicon, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Funciones auxiliares para usar en componentes
 */

// Hook para usar en páginas que necesitan verificar permisos
export function useRouteProtection(requiredRoles: string[]) {
  // Esta función sería implementada en el lado del cliente
  // usando el contexto de autenticación
  return {
    hasAccess: true, // Placeholder
    isLoading: false,
    user: null
  };
}

// Función para verificar permisos específicos
export async function checkUserPermission(
  userRole: string,
  requiredRoles: string[]
): Promise<boolean> {
  return requiredRoles.includes(userRole);
}

// Constantes exportadas para usar en otros archivos
export const AUTH_ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente', 
  STAFF: 'staff',
  HOST: 'host'
} as const;

export const ROLE_HIERARCHY = {
  [AUTH_ROLES.HOST]: 1,
  [AUTH_ROLES.STAFF]: 2,
  [AUTH_ROLES.GERENTE]: 3,
  [AUTH_ROLES.ADMIN]: 4
} as const;

// Función para verificar jerarquía de roles
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] || 0;
  return userLevel >= minimumLevel;
}