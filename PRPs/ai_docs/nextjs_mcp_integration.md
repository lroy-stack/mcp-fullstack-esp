# Integración Next.js con Servidor MCP

Este documento detalla los patrones de integración entre aplicaciones Next.js y el Servidor MCP Full Stack Developer, mostrando cómo las herramientas MCP generan código Next.js de calidad empresarial.

## 🔌 Arquitectura de Integración

### **Flujo de Generación MCP → Next.js**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  PRP Input      │───▶│  MCP Server     │───▶│  Next.js App    │
│                 │    │                 │    │                 │
│ - Requirements  │    │ - parseFullStack│    │ - Components    │
│ - Domain specs  │    │ - generateComp  │    │ - APIs          │
│ - UI patterns   │    │ - generateAPI   │    │ - Database      │
│ - Business rules│    │ - generateDB    │    │ - Tests         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Herramientas MCP ↔ Next.js Mapping**
```typescript
interface MCPToNextJSMapping {
  // Generación de código específico Next.js
  generateComponent: {
    input: ComponentSpec;
    output: {
      component: NextJSComponent;     // .tsx con App Router patterns
      page: NextJSPage;              // app/page.tsx
      layout: NextJSLayout;          // app/layout.tsx  
      loading: LoadingUI;            // app/loading.tsx
      error: ErrorBoundary;          // app/error.tsx
      tests: ComponentTests;         // .test.tsx
    };
  };
  
  generateAPI: {
    input: APISpec;
    output: {
      handler: NextJSAPIRoute;       // app/api/route.ts
      types: TypeDefinitions;        // types.ts
      middleware: AuthMiddleware;     // middleware.ts
      validation: ZodSchemas;        // validations.ts
      tests: APITests;               // .test.ts
    };
  };
  
  generatePage: {
    input: PageSpec;
    output: {
      page: NextJSAppRouterPage;     // app/[route]/page.tsx
      metadata: SEOMetadata;         // metadata.ts
      sitemap: SitemapGeneration;    // sitemap.ts
      robots: RobotsConfig;          // robots.ts
    };
  };
}
```

## 🏗️ Patrones de Generación de Componentes

### **1. generateComponent - React Components**

#### **Input Schema**
```typescript
const ComponentGenerationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['form', 'display', 'layout', 'interactive', 'data']),
  props: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string().optional()
  })),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    size: z.enum(['sm', 'md', 'lg', 'xl']),
    variant: z.enum(['default', 'outline', 'ghost', 'destructive'])
  }),
  accessibility: z.object({
    ariaLabel: z.string().optional(),
    role: z.string().optional(),
    keyboardNavigation: z.boolean().default(true),
    screenReaderSupport: z.boolean().default(true)
  }),
  domain: z.string().optional() // ej: 'restaurant', 'ecommerce'
});
```

#### **Generated Component Pattern**
```typescript
// Generado por generateComponent MCP tool
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Esquema de validación auto-generado
const ReservationFormSchema = z.object({
  customerName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  partySize: z.number().min(1).max(20),
  dateTime: z.date().min(new Date(), 'Fecha debe ser futura'),
  specialRequests: z.string().optional(),
});

type ReservationFormData = z.infer<typeof ReservationFormSchema>;

// 2. Props interface auto-generada
interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => Promise<void>;
  defaultValues?: Partial<ReservationFormData>;
  disabled?: boolean;
  className?: string;
}

// 3. Componente principal auto-generado
export function ReservationForm({
  onSubmit,
  defaultValues,
  disabled = false,
  className
}: ReservationFormProps) {
  // 4. React Hook Form setup auto-generado
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationFormSchema),
    defaultValues
  });

  // 5. Submit handler auto-generado
  const handleSubmit = async (data: ReservationFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      toast.success('Reserva creada exitosamente');
    } catch (error) {
      toast.error('Error al crear reserva');
      console.error('Reservation form error:', error);
    }
  };

  return (
    <form 
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn('space-y-6', className)}
      role="form"
      aria-label="Formulario de reserva"
    >
      {/* 6. Campos auto-generados con accesibilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Nombre del Cliente</Label>
          <Input
            id="customerName"
            {...form.register('customerName')}
            disabled={disabled}
            aria-describedby="customerName-error"
          />
          {form.formState.errors.customerName && (
            <p id="customerName-error" className="text-sm text-red-600" role="alert">
              {form.formState.errors.customerName.message}
            </p>
          )}
        </div>
        
        {/* Más campos auto-generados... */}
      </div>

      {/* 7. Botones auto-generados */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={disabled || form.formState.isSubmitting}
          className="flex-1"
        >
          {form.formState.isSubmitting ? 'Creando...' : 'Crear Reserva'}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => form.reset()}
          disabled={disabled}
        >
          Limpiar
        </Button>
      </div>
    </form>
  );
}

// 8. Tests auto-generados
export const ReservationFormTests = {
  'renders all fields correctly': () => {
    const mockSubmit = jest.fn();
    render(<ReservationForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/nombre del cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
  },
  
  'validates input correctly': async () => {
    const mockSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<ReservationForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /crear reserva/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/nombre debe tener/i)).toBeInTheDocument();
  },
  
  'submits valid data': async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    
    render(<ReservationForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com');
    // ... más inputs
    
    await user.click(screen.getByRole('button', { name: /crear reserva/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      customerName: 'Juan Pérez',
      email: 'juan@example.com',
      // ... datos esperados
    });
  }
};
```

### **2. generatePage - Next.js App Router Pages**

#### **Input Schema**
```typescript
const PageGenerationSchema = z.object({
  route: z.string(),                    // '/dashboard/reservations'
  title: z.string(),                    // 'Gestión de Reservas'
  description: z.string(),              // Meta description
  components: z.array(z.string()),      // ['ReservationForm', 'ReservationList']
  layout: z.enum(['default', 'auth', 'dashboard', 'public']),
  auth: z.object({
    required: z.boolean(),
    roles: z.array(z.string()).optional()
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).optional(),
    canonical: z.string().optional()
  })
});
```

#### **Generated Page Pattern**
```typescript
// app/dashboard/reservations/page.tsx - Auto-generado
import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ReservationForm } from '@/components/forms/reservation-form';
import { ReservationList } from '@/components/data/reservation-list';
import { PageHeader } from '@/components/layouts/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authOptions } from '@/lib/auth';

// 1. Metadata auto-generada
export const metadata: Metadata = {
  title: 'Gestión de Reservas | Restaurant Admin',
  description: 'Gestiona las reservas de tu restaurante de manera eficiente',
  keywords: ['reservas', 'restaurante', 'gestión', 'admin'],
  robots: 'noindex, nofollow', // Para páginas autenticadas
};

// 2. Componente de página auto-generado
export default async function ReservationsPage() {
  // 3. Autenticación del lado del servidor
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // 4. Verificación de roles si aplica
  if (!session.user.roles?.includes('staff') && !session.user.roles?.includes('admin')) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      {/* 5. Header de página auto-generado */}
      <PageHeader
        title="Gestión de Reservas"
        description="Crea y gestiona las reservas de tu restaurante"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reservas', href: '/dashboard/reservations' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 6. Formulario de nueva reserva */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Nueva Reserva</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ReservationForm
                onSubmit={async (data) => {
                  'use server';
                  // Server action auto-generada
                  const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  if (!response.ok) {
                    throw new Error('Error creating reservation');
                  }
                  
                  revalidatePath('/dashboard/reservations');
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* 7. Lista de reservas existentes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <ReservationList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. Loading UI auto-generado
// app/dashboard/reservations/loading.tsx
export default function ReservationsLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// 9. Error boundary auto-generado
// app/dashboard/reservations/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ReservationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Reservations page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Error al cargar reservas
        </h2>
        <p className="text-gray-600 mb-6">
          Ocurrió un error inesperado. Por favor intenta nuevamente.
        </p>
        <Button onClick={reset}>Intentar nuevamente</Button>
      </div>
    </div>
  );
}
```

### **3. generateAPI - Next.js API Routes**

#### **Input Schema**
```typescript
const APIGenerationSchema = z.object({
  endpoint: z.string(),                 // '/api/reservations'
  methods: z.array(z.enum(['GET', 'POST', 'PUT', 'DELETE'])),
  auth: z.object({
    required: z.boolean(),
    roles: z.array(z.string()).optional()
  }),
  validation: z.object({
    input: z.record(z.any()),          // Zod schema como objeto
    output: z.record(z.any())          // Zod schema para respuesta
  }),
  database: z.object({
    table: z.string(),
    operations: z.array(z.enum(['create', 'read', 'update', 'delete']))
  }),
  rateLimit: z.object({
    requests: z.number().default(100),
    window: z.number().default(3600)   // en segundos
  })
});
```

#### **Generated API Pattern**
```typescript
// app/api/reservations/route.ts - Auto-generado
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit';
import { createReservation, getReservations } from '@/lib/db/reservations';
import { authOptions } from '@/lib/auth';

// 1. Schemas de validación auto-generados
const CreateReservationSchema = z.object({
  customerName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  partySize: z.number().int().min(1).max(20),
  dateTime: z.string().datetime(),
  specialRequests: z.string().max(500).optional(),
});

const GetReservationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  date: z.string().date().optional(),
});

// 2. GET handler auto-generado
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 100, 3600);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validación de query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const validatedQuery = GetReservationsQuerySchema.parse(params);

    // Autorización
    const userRoles = session.user.roles || [];
    if (!userRoles.includes('staff') && !userRoles.includes('admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Lógica de negocio
    const reservations = await getReservations({
      ...validatedQuery,
      userId: session.user.id,
      userRoles
    });

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'reservations_list',
      resource: 'reservations',
      metadata: validatedQuery
    });

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: reservations.total
      }
    });

  } catch (error) {
    console.error('GET /api/reservations error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 3. POST handler auto-generado
export async function POST(request: NextRequest) {
  try {
    // Rate limiting más estricto para creación
    const rateLimitResult = await rateLimit(request, 20, 3600);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validación del body
    const body = await request.json();
    const validatedData = CreateReservationSchema.parse(body);

    // Validaciones de negocio específicas
    const reservationDateTime = new Date(validatedData.dateTime);
    if (reservationDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Reservation date must be in the future' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad (lógica específica del dominio)
    const isAvailable = await checkAvailability(
      reservationDateTime,
      validatedData.partySize
    );
    
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'No tables available for the requested time' },
        { status: 409 }
      );
    }

    // Crear reserva
    const reservation = await createReservation({
      ...validatedData,
      createdBy: session.user.id,
      status: 'pending'
    });

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'reservation_created',
      resource: 'reservations',
      resourceId: reservation.id,
      metadata: validatedData
    });

    // Notificaciones automáticas (si configurado)
    await sendReservationNotification(reservation);

    return NextResponse.json({
      success: true,
      data: reservation
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/reservations error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 4. Tests auto-generados
export const ReservationsAPITests = {
  'GET returns reservations for authenticated user': async () => {
    const mockSession = { user: { id: '1', roles: ['staff'] } };
    const response = await GET(mockRequest);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  },
  
  'POST creates reservation with valid data': async () => {
    const validReservation = {
      customerName: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '1234567890',
      partySize: 4,
      dateTime: new Date(Date.now() + 86400000).toISOString()
    };
    
    const response = await POST(mockRequestWithBody(validReservation));
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
  },
  
  'POST validates input correctly': async () => {
    const invalidReservation = {
      customerName: 'A', // Too short
      email: 'invalid-email',
      partySize: 0 // Invalid
    };
    
    const response = await POST(mockRequestWithBody(invalidReservation));
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid input');
    expect(data.details).toBeDefined();
  }
};
```

## 🔄 Server Actions Integration

### **Server Actions Pattern**
```typescript
// app/actions/reservations.ts - Auto-generado
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { createReservation } from '@/lib/db/reservations';

const CreateReservationActionSchema = z.object({
  customerName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  partySize: z.number().int().min(1).max(20),
  dateTime: z.date(),
  specialRequests: z.string().max(500).optional(),
});

export async function createReservationAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Autenticación
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Authentication required' };
    }

    // Extraer y validar datos del form
    const rawData = {
      customerName: formData.get('customerName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      partySize: parseInt(formData.get('partySize') as string),
      dateTime: new Date(formData.get('dateTime') as string),
      specialRequests: formData.get('specialRequests') as string || undefined,
    };

    const validatedData = CreateReservationActionSchema.parse(rawData);

    // Crear reserva
    const reservation = await createReservation({
      ...validatedData,
      createdBy: session.user.id,
      status: 'pending'
    });

    // Revalidar caché
    revalidatePath('/dashboard/reservations');
    revalidatePath('/api/reservations');

    return { success: true, data: reservation };

  } catch (error) {
    console.error('Create reservation action error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input: ' + error.issues.map(i => i.message).join(', ')
      };
    }

    return { success: false, error: 'Failed to create reservation' };
  }
}
```

## 📱 Responsive & Accessibility Patterns

### **Responsive Design Auto-Generated**
```typescript
// Componente auto-generado con responsive design
export function ReservationCalendar({ reservations }: CalendarProps) {
  return (
    <div className="w-full">
      {/* Mobile view */}
      <div className="block md:hidden">
        <MobileCalendarView reservations={reservations} />
      </div>
      
      {/* Tablet view */}
      <div className="hidden md:block lg:hidden">
        <TabletCalendarView reservations={reservations} />
      </div>
      
      {/* Desktop view */}
      <div className="hidden lg:block">
        <DesktopCalendarView reservations={reservations} />
      </div>
    </div>
  );
}
```

### **Accessibility Auto-Generated**
```typescript
// Patrones de accesibilidad auto-aplicados
export function AccessibleButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      // Auto-generated accessibility props
      role="button"
      tabIndex={0}
      aria-label={props['aria-label'] || children?.toString()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onClick?.(e as any);
        }
      }}
    >
      {children}
    </Button>
  );
}
```

## 🔧 Build & Deployment Integration

### **Next.js Config Auto-Generated**
```typescript
// next.config.js - Auto-generado por MCP
const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Auto-generated optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Auto-generated security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

**Esta integración permite que el Servidor MCP genere aplicaciones Next.js completas, siguiendo todas las mejores prácticas y patrones modernos, con código listo para producción desde el primer intento.**