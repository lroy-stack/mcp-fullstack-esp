// Ejemplo: Hook para Estrategias de Caché con TanStack Query
// Patrón: Cache Strategies + Performance + Background Updates + Memory Management

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  useQuery, 
  useQueries, 
  useQueryClient, 
  useInfiniteQuery,
  QueryKey,
  UseQueryOptions,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';

// Tipos para configuraciones de caché
interface CacheStrategy {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  refetchInterval?: number;
  retry: number | ((failureCount: number, error: Error) => boolean);
  retryDelay: number | ((retryAttempt: number) => number);
}

interface CacheConfig {
  strategy: 'aggressive' | 'balanced' | 'conservative' | 'real-time' | 'offline-first';
  customStrategy?: Partial<CacheStrategy>;
  enablePrefetch?: boolean;
  enableBackground?: boolean;
  maxCacheSize?: number;
}

interface PrefetchConfig {
  queryKey: QueryKey;
  queryFn: () => Promise<any>;
  options?: Partial<UseQueryOptions>;
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalQueries: number;
  cacheSize: number;
  lastCleanup: Date | null;
}

// Estrategias de caché predefinidas
const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // Para datos que cambian muy poco (configuración, zonas)
  aggressive: {
    staleTime: 30 * 60 * 1000,      // 30 minutos
    gcTime: 60 * 60 * 1000,         // 1 hora
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  
  // Para datos que cambian moderadamente (clientes, estadísticas)
  balanced: {
    staleTime: 5 * 60 * 1000,       // 5 minutos
    gcTime: 10 * 60 * 1000,         // 10 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 1000
  },
  
  // Para datos críticos pero no tan dinámicos (reservas del día)
  conservative: {
    staleTime: 1 * 60 * 1000,       // 1 minuto
    gcTime: 5 * 60 * 1000,          // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 500
  },
  
  // Para datos que cambian constantemente (estados de mesa)
  'real-time': {
    staleTime: 0,                   // Siempre stale
    gcTime: 1 * 60 * 1000,          // 1 minuto
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30000,         // 30 segundos
    retry: 0,                       // No retry para tiempo real
    retryDelay: 0
  },
  
  // Para modo offline o conexión lenta
  'offline-first': {
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 72 * 60 * 60 * 1000,    // 72 horas
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: attemptIndex => Math.min(2000 * 2 ** attemptIndex, 60000)
  }
};

/**
 * Hook principal para gestión avanzada de caché
 * 
 * @example
 * ```tsx
 * const { 
 *   data, 
 *   prefetchRelated, 
 *   invalidatePattern,
 *   cacheMetrics 
 * } = useDataCache({
 *   queryKey: ['reservations', filters],
 *   queryFn: () => api.getReservations(filters),
 *   strategy: 'real-time',
 *   enablePrefetch: true,
 *   prefetchConfig: [
 *     {
 *       queryKey: ['tables'],
 *       queryFn: () => api.getTables()
 *     }
 *   ]
 * });
 * ```
 */
export function useDataCache<T = any>(config: {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  strategy?: CacheConfig['strategy'];
  customStrategy?: Partial<CacheStrategy>;
  enablePrefetch?: boolean;
  prefetchConfig?: PrefetchConfig[];
  enabled?: boolean;
}) {
  const {
    queryKey,
    queryFn,
    strategy = 'balanced',
    customStrategy = {},
    enablePrefetch = false,
    prefetchConfig = [],
    enabled = true
  } = config;

  const queryClient = useQueryClient();
  const metricsRef = useRef<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalQueries: 0,
    cacheSize: 0,
    lastCleanup: null
  });

  // Obtener estrategia de caché final
  const cacheStrategy = useMemo(() => {
    const baseStrategy = CACHE_STRATEGIES[strategy];
    return { ...baseStrategy, ...customStrategy };
  }, [strategy, customStrategy]);

  // Query principal con estrategia aplicada
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      metricsRef.current.totalQueries++;
      const result = await queryFn();
      return result;
    },
    enabled,
    ...cacheStrategy,
    meta: {
      strategy,
      cacheKey: queryKey.join(':')
    }
  });

  // Función para prefetch de datos relacionados
  const prefetchRelated = useCallback(async () => {
    if (!enablePrefetch || prefetchConfig.length === 0) return;

    const prefetchPromises = prefetchConfig.map(({ queryKey: prefetchKey, queryFn: prefetchFn, options = {} }) =>
      queryClient.prefetchQuery({
        queryKey: prefetchKey,
        queryFn: prefetchFn,
        ...cacheStrategy,
        ...options
      })
    );

    await Promise.allSettled(prefetchPromises);
  }, [enablePrefetch, prefetchConfig, queryClient, cacheStrategy]);

  // Función para invalidar patrones de queries
  const invalidatePattern = useCallback((pattern: string | RegExp) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach(query => {
      const keyString = query.queryKey.join(':');
      
      if (typeof pattern === 'string') {
        if (keyString.includes(pattern)) {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      } else {
        if (pattern.test(keyString)) {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      }
    });
  }, [queryClient]);

  // Función para limpiar caché selectivamente
  const cleanupCache = useCallback((options: {
    olderThan?: number;
    pattern?: string | RegExp;
    keepActive?: boolean;
  } = {}) => {
    const { olderThan = 60 * 60 * 1000, pattern, keepActive = true } = options;
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach(query => {
      const keyString = query.queryKey.join(':');
      const isOld = Date.now() - query.state.dataUpdatedAt > olderThan;
      const matchesPattern = pattern ? 
        (typeof pattern === 'string' ? keyString.includes(pattern) : pattern.test(keyString)) : 
        true;
      const isActive = keepActive && query.getObserversCount() > 0;
      
      if (isOld && matchesPattern && !isActive) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    metricsRef.current.lastCleanup = new Date();
  }, [queryClient]);

  // Función para obtener métricas de caché
  const getCacheMetrics = useCallback((): CacheMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const hits = queries.filter(q => q.state.status === 'success').length;
    const total = queries.length;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;
    
    return {
      ...metricsRef.current,
      hitRate,
      missRate: 100 - hitRate,
      cacheSize: total
    };
  }, [queryClient]);

  // Función para warmup de caché
  const warmupCache = useCallback(async (warmupQueries: PrefetchConfig[]) => {
    const warmupPromises = warmupQueries.map(({ queryKey: warmupKey, queryFn: warmupFn, options = {} }) =>
      queryClient.prefetchQuery({
        queryKey: warmupKey,
        queryFn: warmupFn,
        ...cacheStrategy,
        ...options
      })
    );

    await Promise.allSettled(warmupPromises);
  }, [queryClient, cacheStrategy]);

  // Efecto para prefetch automático
  useEffect(() => {
    if (query.isSuccess && enablePrefetch) {
      prefetchRelated();
    }
  }, [query.isSuccess, enablePrefetch, prefetchRelated]);

  // Efecto para limpieza automática
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupCache();
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, [cleanupCache]);

  return {
    // Query data
    ...query,
    
    // Cache management
    prefetchRelated,
    invalidatePattern,
    cleanupCache,
    warmupCache,
    
    // Metrics
    cacheMetrics: getCacheMetrics(),
    
    // Strategy info
    strategy,
    cacheStrategy
  };
}

/**
 * Hook para infinite queries con caché optimizado
 */
export function useInfiniteDataCache<T = any>(config: {
  queryKey: QueryKey;
  queryFn: (context: { pageParam?: any }) => Promise<{
    data: T[];
    nextPageParam?: any;
    hasNextPage?: boolean;
  }>;
  strategy?: CacheConfig['strategy'];
  getNextPageParam: (lastPage: any, allPages: any[]) => any;
  initialPageParam?: any;
}) {
  const {
    queryKey,
    queryFn,
    strategy = 'balanced',
    getNextPageParam,
    initialPageParam
  } = config;

  const cacheStrategy = CACHE_STRATEGIES[strategy];

  return useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam,
    ...cacheStrategy,
    // Configuraciones específicas para infinite queries
    maxPages: strategy === 'aggressive' ? undefined : 10,
    meta: {
      strategy,
      type: 'infinite'
    }
  });
}

/**
 * Hook para múltiples queries con gestión unificada de caché
 */
export function useMultipleDataCache(queries: Array<{
  queryKey: QueryKey;
  queryFn: () => Promise<any>;
  strategy?: CacheConfig['strategy'];
  enabled?: boolean;
}>) {
  const queryClient = useQueryClient();

  const queryConfigs = useMemo(() => {
    return queries.map(({ queryKey, queryFn, strategy = 'balanced', enabled = true }) => {
      const cacheStrategy = CACHE_STRATEGIES[strategy];
      
      return {
        queryKey,
        queryFn,
        enabled,
        ...cacheStrategy,
        meta: {
          strategy,
          groupQuery: true
        }
      };
    });
  }, [queries]);

  const results = useQueries({
    queries: queryConfigs,
    combine: (results) => ({
      data: results.map(result => result.data),
      isLoading: results.some(result => result.isLoading),
      isError: results.some(result => result.isError),
      errors: results.map(result => result.error).filter(Boolean),
      refetchAll: () => results.forEach(result => result.refetch())
    })
  });

  // Función para invalidar todas las queries del grupo
  const invalidateAll = useCallback(() => {
    queries.forEach(({ queryKey }) => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queries, queryClient]);

  return {
    ...results,
    invalidateAll
  };
}

/**
 * Hook especializado para datos de restaurante con caché optimizado
 */
export function useRestaurantDataCache() {
  // Configuraciones específicas para diferentes tipos de datos
  const reservationsCache = useDataCache({
    queryKey: ['reservations', 'today'],
    queryFn: () => fetch('/api/reservations?date=today').then(r => r.json()),
    strategy: 'real-time',
    enablePrefetch: true,
    prefetchConfig: [
      {
        queryKey: ['tables'],
        queryFn: () => fetch('/api/tables').then(r => r.json())
      }
    ]
  });

  const tablesCache = useDataCache({
    queryKey: ['tables'],
    queryFn: () => fetch('/api/tables').then(r => r.json()),
    strategy: 'real-time'
  });

  const clientsCache = useDataCache({
    queryKey: ['clients'],
    queryFn: () => fetch('/api/clients').then(r => r.json()),
    strategy: 'balanced'
  });

  const configCache = useDataCache({
    queryKey: ['config', 'restaurant'],
    queryFn: () => fetch('/api/config').then(r => r.json()),
    strategy: 'aggressive'
  });

  return {
    reservations: reservationsCache,
    tables: tablesCache,
    clients: clientsCache,
    config: configCache,
    
    // Función para invalidar todo el caché del restaurante
    invalidateAll: useCallback(() => {
      reservationsCache.invalidatePattern('reservations');
      tablesCache.invalidatePattern('tables');
      clientsCache.invalidatePattern('clients');
      configCache.invalidatePattern('config');
    }, [reservationsCache, tablesCache, clientsCache, configCache])
  };
}

/**
 * Hook para gestión de caché con persistencia local
 */
export function usePersistentCache<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options: {
    strategy?: CacheConfig['strategy'];
    persistKey: string;
    ttl?: number; // Time to live en localStorage
  }
) {
  const { strategy = 'balanced', persistKey, ttl = 24 * 60 * 60 * 1000 } = options;
  
  const query = useDataCache({
    queryKey,
    queryFn: async () => {
      // Intentar cargar desde localStorage primero
      try {
        const stored = localStorage.getItem(persistKey);
        if (stored) {
          const { data, timestamp } = JSON.parse(stored);
          if (Date.now() - timestamp < ttl) {
            return data;
          }
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
      
      // Si no hay datos válidos en localStorage, hacer fetch
      const freshData = await queryFn();
      
      // Guardar en localStorage
      try {
        localStorage.setItem(persistKey, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      
      return freshData;
    },
    strategy
  });

  return query;
}