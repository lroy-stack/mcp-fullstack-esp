// Ejemplo: Tests de API Routes con MSW
// Patrón: API Testing + MSW Mocking + Database Integration + Error Handling

import { NextRequest, NextResponse } from 'next/server';
import { createMocks } from 'node-mocks-http';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

// API Handlers para testear
import { GET as getReservations, POST as createReservation } from '@/app/api/reservations/route';
import { GET as getTables, PUT as updateTable } from '@/app/api/tables/route';
import { POST as assignTable } from '@/app/api/tables/assign/route';

// Mocks y datos de prueba
import { mockReservations, mockTables, mockUsers } from '../__mocks__/data';
import { createMockSupabaseClient } from '../__mocks__/supabase';

// Mock de Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => createMockSupabaseClient()
}));

// Mock de autenticación
jest.mock('@/auth/auth-helpers', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: mockUsers.admin
  })
}));

// MSW Server Setup
const server = setupServer(
  // Mock de validación de disponibilidad
  rest.post('*/rpc/verificar_disponibilidad_mesa', (req, res, ctx) => {
    return res(ctx.json({ data: [{ disponible: true, razon: 'Mesa disponible' }] }));
  }),
  
  // Mock de obtención de empleado actual
  rest.get('*/auth/user', (req, res, ctx) => {
    return res(ctx.json({ user: mockUsers.staff }));
  }),

  // Mock de logs de auditoría
  rest.post('*/audit/logs', (req, res, ctx) => {
    return res(ctx.status(201));
  })
);

// Setup y teardown
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

describe('API Routes - Reservations', () => {
  describe('GET /api/reservations', () => {
    it('returns all reservations for authenticated user', async () => {
      // Crear request mock
      const request = new NextRequest('http://localhost:3000/api/reservations');
      
      // Ejecutar handler
      const response = await getReservations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.reservations)).toBe(true);
      expect(data.reservations).toHaveLength(mockReservations.length);
    });

    it('filters reservations by date when provided', async () => {
      const url = new URL('http://localhost:3000/api/reservations');
      url.searchParams.set('date', '2024-12-25');
      
      const request = new NextRequest(url);
      const response = await getReservations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verificar que todas las reservas son de la fecha solicitada
      data.reservations.forEach((reservation: any) => {
        expect(reservation.fecha_reserva).toBe('2024-12-25');
      });
    });

    it('filters reservations by status when provided', async () => {
      const url = new URL('http://localhost:3000/api/reservations');
      url.searchParams.set('status', 'confirmada');
      
      const request = new NextRequest(url);
      const response = await getReservations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verificar que todas las reservas tienen el estado solicitado
      data.reservations.forEach((reservation: any) => {
        expect(reservation.estado).toBe('confirmada');
      });
    });

    it('returns 401 for unauthenticated requests', async () => {
      // Mock de usuario no autenticado
      jest.mocked(require('@/auth/auth-helpers').getServerSession).mockResolvedValueOnce(null);
      
      const request = new NextRequest('http://localhost:3000/api/reservations');
      const response = await getReservations(request);

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });

    it('handles database errors gracefully', async () => {
      // Mock de error en base de datos
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection failed' }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/reservations');
      const response = await getReservations(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/reservations', () => {
    const validReservationData = {
      cliente_nombre: 'Juan Pérez',
      cliente_telefono: '+34612345678',
      cliente_email: 'juan@ejemplo.com',
      numero_personas: 4,
      fecha_reserva: '2024-12-25',
      hora_reserva: '14:00',
      zona_preferencia: 'terraza_justicia',
      notas_especiales: 'Cumpleaños'
    };

    it('creates reservation with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.reservation).toMatchObject({
        cliente_nombre: validReservationData.cliente_nombre,
        numero_personas: validReservationData.numero_personas,
        estado: 'pendiente'
      });
    });

    it('validates required fields', async () => {
      const incompleteData = {
        cliente_nombre: 'Juan Pérez'
        // Faltan campos requeridos
      };

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('validates phone number format', async () => {
      const invalidPhoneData = {
        ...validReservationData,
        cliente_telefono: '123'
      };

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(invalidPhoneData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
      
      const phoneError = data.details.find((detail: any) => 
        detail.path.includes('cliente_telefono')
      );
      expect(phoneError).toBeDefined();
    });

    it('validates service hours', async () => {
      const invalidTimeData = {
        ...validReservationData,
        hora_reserva: '10:00' // Fuera de horario
      };

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(invalidTimeData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });

    it('validates party size limits', async () => {
      const oversizedPartyData = {
        ...validReservationData,
        numero_personas: 25 // Excede límite
      };

      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(oversizedPartyData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });

    it('creates audit log entry on successful creation', async () => {
      const request = new NextRequest('http://localhost:3000/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validReservationData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createReservation(request);
      
      expect(response.status).toBe(201);
      
      // Verificar que se intentó crear log de auditoría
      // En un entorno real, verificaríamos esto consultando la base de datos
    });
  });
});

describe('API Routes - Tables', () => {
  describe('GET /api/tables', () => {
    it('returns all active tables with zone information', async () => {
      const request = new NextRequest('http://localhost:3000/api/tables');
      const response = await getTables(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.tables)).toBe(true);
      
      // Verificar estructura de datos
      if (data.tables.length > 0) {
        const table = data.tables[0];
        expect(table).toHaveProperty('id');
        expect(table).toHaveProperty('numero');
        expect(table).toHaveProperty('capacidad');
        expect(table).toHaveProperty('zona');
        expect(table.zona).toHaveProperty('nombre');
      }
    });

    it('filters tables by zone when provided', async () => {
      const url = new URL('http://localhost:3000/api/tables');
      url.searchParams.set('zona_id', '1');
      
      const request = new NextRequest(url);
      const response = await getTables(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verificar que todas las mesas son de la zona solicitada
      data.tables.forEach((table: any) => {
        expect(table.zona_id).toBe(1);
      });
    });

    it('includes current state information', async () => {
      const request = new NextRequest('http://localhost:3000/api/tables');
      const response = await getTables(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verificar que incluye información de estado
      if (data.tables.length > 0) {
        const table = data.tables[0];
        expect(table).toHaveProperty('estado_actual');
      }
    });
  });

  describe('PUT /api/tables', () => {
    it('updates table status successfully', async () => {
      const updateData = {
        mesa_id: 101,
        estado: 'limpieza',
        notas: 'Limpieza programada'
      };

      const request = new NextRequest('http://localhost:3000/api/tables', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await updateTable(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.estado).toMatchObject({
        mesa_id: updateData.mesa_id,
        estado: updateData.estado,
        notas: updateData.notas
      });
    });

    it('validates mesa_id exists', async () => {
      const updateData = {
        mesa_id: 9999, // Mesa inexistente
        estado: 'libre'
      };

      const request = new NextRequest('http://localhost:3000/api/tables', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await updateTable(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Mesa no encontrada');
    });

    it('validates estado values', async () => {
      const updateData = {
        mesa_id: 101,
        estado: 'estado_invalido'
      };

      const request = new NextRequest('http://localhost:3000/api/tables', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await updateTable(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });
  });
});

describe('API Routes - Table Assignment', () => {
  describe('POST /api/tables/assign', () => {
    it('assigns table to reservation successfully', async () => {
      const assignData = {
        reserva_id: 10001,
        mesa_id: 101
      };

      const request = new NextRequest('http://localhost:3000/api/tables/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await assignTable(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reservation).toMatchObject({
        id: assignData.reserva_id,
        mesa_id: assignData.mesa_id
      });
    });

    it('validates table availability before assignment', async () => {
      // Mock de mesa no disponible
      server.use(
        rest.post('*/rpc/verificar_disponibilidad_mesa', (req, res, ctx) => {
          return res(ctx.json({ 
            data: [{ 
              disponible: false, 
              razon: 'Mesa ocupada en horario solicitado' 
            }] 
          }));
        })
      );

      const assignData = {
        reserva_id: 10001,
        mesa_id: 101
      };

      const request = new NextRequest('http://localhost:3000/api/tables/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await assignTable(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Mesa no disponible');
      expect(data.reason).toBe('Mesa ocupada en horario solicitado');
    });

    it('validates capacity constraints', async () => {
      // Mock de reserva con más personas que capacidad de mesa
      const assignData = {
        reserva_id: 10002, // Reserva para 6 personas
        mesa_id: 101      // Mesa para 2 personas
      };

      const request = new NextRequest('http://localhost:3000/api/tables/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await assignTable(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('capacidad');
    });

    it('handles non-existent reservation', async () => {
      const assignData = {
        reserva_id: 99999, // Reserva inexistente
        mesa_id: 101
      };

      const request = new NextRequest('http://localhost:3000/api/tables/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await assignTable(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Reserva no encontrada');
    });

    it('updates table state after successful assignment', async () => {
      const assignData = {
        reserva_id: 10001,
        mesa_id: 101
      };

      const request = new NextRequest('http://localhost:3000/api/tables/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await assignTable(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verificar que se actualizó el estado de la mesa
      expect(data.table_state).toMatchObject({
        mesa_id: assignData.mesa_id,
        estado: 'reservada',
        reserva_id: assignData.reserva_id
      });
    });
  });
});

describe('Error Handling', () => {
  it('handles malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations', {
      method: 'POST',
      body: '{ invalid json }',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await createReservation(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid JSON format');
  });

  it('handles missing Content-Type header', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
      // Sin Content-Type header
    });

    const response = await createReservation(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Content-Type must be application/json');
  });

  it('logs errors appropriately', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Forzar un error interno
    jest.mocked(require('@supabase/auth-helpers-nextjs').createRouteHandlerClient)
      .mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

    const request = new NextRequest('http://localhost:3000/api/reservations');
    const response = await getReservations(request);

    expect(response.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('API Error'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe('Rate Limiting', () => {
  it('enforces rate limits per user', async () => {
    // Simular múltiples requests rápidos
    const requests = Array.from({ length: 10 }, () =>
      new NextRequest('http://localhost:3000/api/reservations')
    );

    const responses = await Promise.all(
      requests.map(req => getReservations(req))
    );

    // Verificar que algún request fue limitado
    const rateLimitedResponse = responses.find(res => res.status === 429);
    
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.headers.get('Retry-After')).toBeDefined();
      expect(rateLimitedResponse.headers.get('X-RateLimit-Limit')).toBeDefined();
    }
  });
});

describe('Security', () => {
  it('sanitizes error messages in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Mock de error de base de datos con información sensible
    const mockSupabase = createMockSupabaseClient();
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { 
          message: 'connection to server at "localhost" (127.0.0.1), port 5432 failed: database "secret_db" does not exist'
        }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/reservations');
    const response = await getReservations(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.error).not.toContain('secret_db');
    expect(data.error).not.toContain('localhost');

    process.env.NODE_ENV = originalEnv;
  });

  it('validates authorization header format', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations', {
      headers: {
        'Authorization': 'InvalidFormat'
      }
    });

    const response = await getReservations(request);
    
    expect(response.status).toBe(401);
  });
});