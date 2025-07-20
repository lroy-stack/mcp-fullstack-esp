// Ejemplo: Tests de Componentes con React Testing Library
// Patrón: Component Testing + User Events + Mock Integration + Accessibility

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Componentes a testear (importados desde el proyecto)
import { ReservationForm } from '@/components/forms/ReservationForm';
import { TableGrid } from '@/components/tables/TableGrid';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { AuthProvider } from '@/auth/auth-helpers';

// Mocks
import { createMockSupabaseClient } from '../__mocks__/supabase';
import { mockReservations, mockTables, mockUser } from '../__mocks__/data';

// Mock de Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => createMockSupabaseClient()
}));

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '/reservations'
}));

// Mock de sonidos y notificaciones
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Helper para crear QueryClient de test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });
}

// Wrapper de test con providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Helper para renderizar con wrapper
function renderWithProviders(component: React.ReactElement) {
  return render(component, { wrapper: TestWrapper });
}

describe('ReservationForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required form fields', () => {
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Verificar campos requeridos
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número de personas/i)).toBeInTheDocument();
    
    // Verificar campos opcionales
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zona de preferencia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notas especiales/i)).toBeInTheDocument();
    
    // Verificar botones
    expect(screen.getByRole('button', { name: /crear reserva/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /crear reserva/i });
    
    // Intentar enviar formulario vacío
    await user.click(submitButton);

    // Verificar que aparecen mensajes de error
    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/formato de teléfono español inválido/i)).toBeInTheDocument();
    });

    // Verificar que no se llamó onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates phone number format correctly', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const phoneInput = screen.getByLabelText(/teléfono/i);
    
    // Probar formato inválido
    await user.type(phoneInput, '123');
    await user.tab(); // Trigger validation
    
    await waitFor(() => {
      expect(screen.getByText(/formato de teléfono español inválido/i)).toBeInTheDocument();
    });

    // Limpiar y probar formato válido
    await user.clear(phoneInput);
    await user.type(phoneInput, '612345678');
    
    await waitFor(() => {
      expect(screen.queryByText(/formato de teléfono español inválido/i)).not.toBeInTheDocument();
    });
  });

  it('validates service hours correctly', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const timeInput = screen.getByLabelText(/hora/i);
    
    // Probar hora fuera de servicio
    await user.type(timeInput, '10:00');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/horario fuera del servicio/i)).toBeInTheDocument();
    });

    // Probar hora válida
    await user.clear(timeInput);
    await user.type(timeInput, '14:00');
    
    await waitFor(() => {
      expect(screen.queryByText(/horario fuera del servicio/i)).not.toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Llenar formulario con datos válidos
    await user.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/teléfono/i), '612345678');
    await user.type(screen.getByLabelText(/email/i), 'juan@ejemplo.com');
    await user.type(screen.getByLabelText(/fecha/i), '2024-12-25');
    await user.type(screen.getByLabelText(/hora/i), '14:00');
    await user.type(screen.getByLabelText(/número de personas/i), '4');
    await user.type(screen.getByLabelText(/notas especiales/i), 'Cumpleaños');

    // Enviar formulario
    await user.click(screen.getByRole('button', { name: /crear reserva/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        cliente_nombre: 'Juan Pérez',
        cliente_telefono: '+34612345678',
        cliente_email: 'juan@ejemplo.com',
        numero_personas: 4,
        fecha_reserva: '2024-12-25',
        hora_reserva: '14:00',
        zona_preferencia: 'sin_preferencia',
        notas_especiales: 'Cumpleaños',
        origen: 'web'
      });
    });
  });

  it('resets form when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Llenar algunos campos
    await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
    await user.type(screen.getByLabelText(/teléfono/i), '612345678');

    // Hacer click en limpiar
    await user.click(screen.getByRole('button', { name: /limpiar/i }));

    // Verificar que los campos se limpiaron
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const nameInput = screen.getByLabelText(/nombre completo/i);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    
    // Verificar navegación con Tab
    nameInput.focus();
    expect(nameInput).toHaveFocus();
    
    await user.tab();
    expect(phoneInput).toHaveFocus();
  });
});

describe('TableGrid Component', () => {
  const mockOnTableClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock del hook useTableStates
    jest.doMock('@/hooks/use-table-states', () => ({
      useTableStates: () => ({
        tables: mockTables,
        isLoading: false,
        error: null
      })
    }));
  });

  it('renders table grid with correct structure', () => {
    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    // Verificar que se renderizan las zonas
    expect(screen.getByText('Terraza Justicia')).toBeInTheDocument();
    expect(screen.getByText('Terraza Campanari')).toBeInTheDocument();
    
    // Verificar que se renderizan las mesas
    expect(screen.getByText('Mesa T1')).toBeInTheDocument();
    expect(screen.getByText('Mesa T20')).toBeInTheDocument();
    
    // Verificar leyenda de estados
    expect(screen.getByText('Libre')).toBeInTheDocument();
    expect(screen.getByText('Ocupada')).toBeInTheDocument();
    expect(screen.getByText('Reservada')).toBeInTheDocument();
  });

  it('displays table information correctly', () => {
    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    const mesa1 = screen.getByText('Mesa T1').closest('.cursor-pointer');
    
    // Verificar información de capacidad
    expect(mesa1).toHaveTextContent('2'); // Capacidad
    expect(mesa1).toHaveTextContent('Terraza Justicia'); // Zona
  });

  it('shows loading state', () => {
    // Mock loading state
    jest.doMock('@/hooks/use-table-states', () => ({
      useTableStates: () => ({
        tables: [],
        isLoading: true,
        error: null
      })
    }));

    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    // Verificar skeletons de loading
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.some(el => el.classList.contains('animate-pulse'))).toBe(true);
  });

  it('shows error state with retry button', () => {
    const mockError = new Error('Error de conexión');
    
    jest.doMock('@/hooks/use-table-states', () => ({
      useTableStates: () => ({
        tables: [],
        isLoading: false,
        error: mockError
      })
    }));

    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    expect(screen.getByText(/error al cargar las mesas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('calls onTableClick when table is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    const mesa1 = screen.getByText('Mesa T1').closest('button') || 
                 screen.getByText('Mesa T1').closest('.cursor-pointer');
    
    if (mesa1) {
      await user.click(mesa1);
      expect(mockOnTableClick).toHaveBeenCalledWith(
        expect.objectContaining({
          numero: 'T1',
          capacidad: 2,
          zona: expect.objectContaining({
            nombre: 'Terraza Justicia'
          })
        })
      );
    }
  });

  it('has proper ARIA labels for accessibility', () => {
    renderWithProviders(
      <TableGrid onTableClick={mockOnTableClick} />
    );

    // Verificar que las mesas tienen labels descriptivos
    const mesa1 = screen.getByText('Mesa T1').closest('[role]');
    expect(mesa1).toHaveAttribute('aria-label', expect.stringContaining('Mesa T1'));
  });
});

describe('ReservationCard Component', () => {
  const mockReservation = mockReservations[0];
  const mockOnEdit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays reservation information correctly', () => {
    renderWithProviders(
      <ReservationCard 
        reservation={mockReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(mockReservation.cliente_nombre)).toBeInTheDocument();
    expect(screen.getByText(mockReservation.cliente_telefono)).toBeInTheDocument();
    expect(screen.getByText(`${mockReservation.numero_personas} personas`)).toBeInTheDocument();
  });

  it('shows different styles based on reservation status', () => {
    const pendingReservation = { ...mockReservation, estado: 'pendiente' as const };
    const { rerender } = renderWithProviders(
      <ReservationCard 
        reservation={pendingReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    // Verificar estilo para pendiente
    expect(screen.getByText('pendiente')).toHaveClass('bg-yellow-500');

    // Cambiar a confirmada
    const confirmedReservation = { ...mockReservation, estado: 'confirmada' as const };
    rerender(
      <ReservationCard 
        reservation={confirmedReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('confirmada')).toHaveClass('bg-blue-500');
  });

  it('shows urgency indicator for near reservations', () => {
    const nearReservation = {
      ...mockReservation,
      fecha_reserva: new Date().toISOString().split('T')[0],
      hora_reserva: new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5) // 10 min
    };

    renderWithProviders(
      <ReservationCard 
        reservation={nearReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    // Verificar indicador de urgencia
    const urgencyIcon = screen.getByTestId('urgency-indicator');
    expect(urgencyIcon).toHaveClass('animate-pulse');
  });

  it('calls action handlers when buttons are clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ReservationCard 
        reservation={mockReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    // Click en editar
    const editButton = screen.getByRole('button', { name: /editar/i });
    await user.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockReservation);

    // Click en cancelar
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledWith(mockReservation);
  });

  it('shows mesa information when assigned', () => {
    const reservationWithTable = {
      ...mockReservation,
      mesa_asignada: {
        numero: 'T1',
        zona: { nombre: 'Terraza Justicia' }
      }
    };

    renderWithProviders(
      <ReservationCard 
        reservation={reservationWithTable}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Mesa T1')).toBeInTheDocument();
  });

  it('handles long customer names gracefully', () => {
    const longNameReservation = {
      ...mockReservation,
      cliente_nombre: 'Juan Carlos Francisco de los Santos Rodríguez García-López'
    };

    renderWithProviders(
      <ReservationCard 
        reservation={longNameReservation}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    const nameElement = screen.getByText(longNameReservation.cliente_nombre);
    expect(nameElement).toHaveStyle('overflow: hidden');
  });
});

// Tests de integración
describe('Integration Tests', () => {
  it('reservation form integrates with table grid for real-time updates', async () => {
    const user = userEvent.setup();
    
    // Mock de la función de creación de reserva
    const mockCreateReservation = jest.fn().mockResolvedValue({
      success: true,
      data: { id: 123, ...mockReservations[0] }
    });

    renderWithProviders(
      <div>
        <ReservationForm onSubmit={mockCreateReservation} />
        <TableGrid onTableClick={jest.fn()} />
      </div>
    );

    // Crear nueva reserva
    await user.type(screen.getByLabelText(/nombre completo/i), 'Test User');
    await user.type(screen.getByLabelText(/teléfono/i), '612345678');
    await user.type(screen.getByLabelText(/fecha/i), '2024-12-25');
    await user.type(screen.getByLabelText(/hora/i), '14:00');
    await user.type(screen.getByLabelText(/número de personas/i), '2');

    await user.click(screen.getByRole('button', { name: /crear reserva/i }));

    await waitFor(() => {
      expect(mockCreateReservation).toHaveBeenCalled();
    });
    
    // Verificar que el formulario se limpió
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
  });

  it('maintains accessibility across component interactions', async () => {
    const user = userEvent.setup();
    
    const { container } = renderWithProviders(
      <div>
        <ReservationForm onSubmit={jest.fn()} />
        <TableGrid onTableClick={jest.fn()} />
      </div>
    );

    // Interactuar con componentes
    await user.type(screen.getByLabelText(/nombre completo/i), 'Test');
    await user.click(screen.getByText('Mesa T1').closest('button') || document.body);

    // Verificar accesibilidad después de interacciones
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Cleanup después de todos los tests
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});