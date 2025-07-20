// Ejemplo: Tests E2E con Playwright
// Patrón: End-to-End Testing + Real User Flows + Cross-browser + Performance

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';

// Configuración de test
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = 'admin@enigmaconalma.com';
const TEST_USER_PASSWORD = 'test123';

// Datos de prueba
const TEST_RESERVATION = {
  nombre: 'Juan Pérez E2E',
  telefono: '612345678',
  email: 'juan.e2e@ejemplo.com',
  fecha: '2024-12-25',
  hora: '14:00',
  personas: '4',
  notas: 'Test E2E - Cumpleaños'
};

const TEST_CLIENT = {
  nombre: 'María García E2E',
  telefono: '687654321',
  email: 'maria.e2e@ejemplo.com',
  notas: 'Cliente VIP para testing'
};

// Helpers de autenticación
async function login(page: Page, email: string = TEST_USER_EMAIL, password: string = TEST_USER_PASSWORD) {
  await page.goto(`${BASE_URL}/login`);
  
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  
  await page.click('[data-testid="login-button"]');
  
  // Esperar a que la autenticación complete
  await page.waitForURL(`${BASE_URL}/dashboard`);
  
  // Verificar que el usuario está logueado
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
}

async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(`${BASE_URL}/login`);
}

// Setup y teardown
test.beforeEach(async ({ page }) => {
  // Configurar interceptores para APIs
  await page.route('**/api/reservations', async route => {
    if (route.request().method() === 'GET') {
      await route.continue();
    }
  });
  
  // Limpiar localStorage
  await page.evaluate(() => localStorage.clear());
});

test.afterEach(async ({ page }) => {
  // Limpiar datos de prueba si es necesario
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Verificar elementos del formulario
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    
    // Intentar login
    await login(page);
    
    // Verificar redirección a dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    await page.click('[data-testid="login-button"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Credenciales inválidas');
    
    // Verificar que no hay redirección
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await logout(page);
    
    // Verificar redirección a login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verificar redirección
    await page.waitForURL(`${BASE_URL}/login`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe('Reservation Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create a new reservation successfully', async ({ page }) => {
    // Navegar a reservas
    await page.click('[data-testid="nav-reservations"]');
    await page.waitForURL(`${BASE_URL}/reservations`);
    
    // Hacer click en nueva reserva
    await page.click('[data-testid="new-reservation-button"]');
    
    // Llenar formulario
    await page.fill('[data-testid="cliente-nombre-input"]', TEST_RESERVATION.nombre);
    await page.fill('[data-testid="cliente-telefono-input"]', TEST_RESERVATION.telefono);
    await page.fill('[data-testid="cliente-email-input"]', TEST_RESERVATION.email);
    await page.fill('[data-testid="fecha-reserva-input"]', TEST_RESERVATION.fecha);
    await page.fill('[data-testid="hora-reserva-input"]', TEST_RESERVATION.hora);
    await page.fill('[data-testid="numero-personas-input"]', TEST_RESERVATION.personas);
    await page.fill('[data-testid="notas-especiales-input"]', TEST_RESERVATION.notas);
    
    // Enviar formulario
    await page.click('[data-testid="submit-reservation-button"]');
    
    // Verificar éxito
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reserva creada exitosamente');
    
    // Verificar que aparece en la lista
    await expect(page.locator(`[data-testid="reservation-${TEST_RESERVATION.nombre}"]`)).toBeVisible();
  });

  test('should validate required fields in reservation form', async ({ page }) => {
    await page.click('[data-testid="nav-reservations"]');
    await page.click('[data-testid="new-reservation-button"]');
    
    // Intentar enviar formulario vacío
    await page.click('[data-testid="submit-reservation-button"]');
    
    // Verificar mensajes de error
    await expect(page.locator('[data-testid="nombre-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="telefono-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="fecha-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="hora-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="personas-error"]')).toBeVisible();
  });

  test('should edit existing reservation', async ({ page }) => {
    await page.click('[data-testid="nav-reservations"]');
    
    // Buscar primera reserva y editarla
    const firstReservation = page.locator('[data-testid^="reservation-"]').first();
    await firstReservation.click();
    
    await page.click('[data-testid="edit-reservation-button"]');
    
    // Cambiar número de personas
    await page.fill('[data-testid="numero-personas-input"]', '6');
    
    // Guardar cambios
    await page.click('[data-testid="save-changes-button"]');
    
    // Verificar éxito
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reserva actualizada');
  });

  test('should cancel reservation', async ({ page }) => {
    await page.click('[data-testid="nav-reservations"]');
    
    // Buscar reserva para cancelar
    const reservationToCancel = page.locator('[data-testid^="reservation-"]').first();
    await reservationToCancel.click();
    
    await page.click('[data-testid="cancel-reservation-button"]');
    
    // Confirmar cancelación en modal
    await page.fill('[data-testid="cancel-reason-input"]', 'Cliente canceló por motivos personales');
    await page.click('[data-testid="confirm-cancel-button"]');
    
    // Verificar cambio de estado
    await expect(page.locator('[data-testid="reservation-status"]')).toContainText('Cancelada');
  });

  test('should assign table to reservation', async ({ page }) => {
    await page.click('[data-testid="nav-reservations"]');
    
    // Buscar reserva sin mesa
    const unassignedReservation = page.locator('[data-testid="unassigned-reservations"] [data-testid^="reservation-"]').first();
    await unassignedReservation.click();
    
    await page.click('[data-testid="assign-table-button"]');
    
    // Seleccionar mesa del modal
    await page.click('[data-testid="table-101"]');
    await page.click('[data-testid="confirm-assignment-button"]');
    
    // Verificar asignación
    await expect(page.locator('[data-testid="assigned-table"]')).toContainText('Mesa T1');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Mesa asignada');
  });
});

test.describe('Table Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('[data-testid="nav-tables"]');
    await page.waitForURL(`${BASE_URL}/tables`);
  });

  test('should display table grid with current states', async ({ page }) => {
    // Verificar que se cargan las zonas
    await expect(page.locator('[data-testid="zona-terraza-justicia"]')).toBeVisible();
    await expect(page.locator('[data-testid="zona-terraza-campanari"]')).toBeVisible();
    
    // Verificar que se muestran las mesas
    await expect(page.locator('[data-testid="mesa-101"]')).toBeVisible();
    await expect(page.locator('[data-testid="mesa-201"]')).toBeVisible();
    
    // Verificar leyenda de estados
    await expect(page.locator('[data-testid="legend-libre"]')).toBeVisible();
    await expect(page.locator('[data-testid="legend-ocupada"]')).toBeVisible();
  });

  test('should change table state', async ({ page }) => {
    // Hacer click en una mesa libre
    const mesa = page.locator('[data-testid="mesa-101"]');
    await mesa.click();
    
    // Cambiar estado en el modal
    await page.click('[data-testid="change-state-button"]');
    await page.selectOption('[data-testid="estado-select"]', 'limpieza');
    await page.fill('[data-testid="notas-input"]', 'Limpieza programada');
    
    await page.click('[data-testid="confirm-state-change"]');
    
    // Verificar cambio visual
    await expect(mesa).toHaveClass(/bg-yellow-500/);
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Estado actualizado');
  });

  test('should drag and drop reservation to table', async ({ page }) => {
    // Verificar que hay reservas sin asignar
    const unassignedReservation = page.locator('[data-testid="unassigned-reservations"] [draggable="true"]').first();
    await expect(unassignedReservation).toBeVisible();
    
    // Hacer drag and drop
    const targetTable = page.locator('[data-testid="mesa-102"]');
    
    await unassignedReservation.dragTo(targetTable);
    
    // Verificar asignación
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Mesa asignada');
    await expect(targetTable).toContainText(TEST_RESERVATION.nombre);
  });

  test('should show table details modal', async ({ page }) => {
    const mesa = page.locator('[data-testid="mesa-101"]');
    await mesa.click();
    
    // Verificar que se abre el modal con información
    await expect(page.locator('[data-testid="table-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-number"]')).toContainText('T1');
    await expect(page.locator('[data-testid="table-capacity"]')).toContainText('2');
    await expect(page.locator('[data-testid="table-zone"]')).toContainText('Terraza Justicia');
  });
});

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('[data-testid="nav-clients"]');
    await page.waitForURL(`${BASE_URL}/clients`);
  });

  test('should create new client', async ({ page }) => {
    await page.click('[data-testid="new-client-button"]');
    
    // Llenar formulario de cliente
    await page.fill('[data-testid="client-name-input"]', TEST_CLIENT.nombre);
    await page.fill('[data-testid="client-phone-input"]', TEST_CLIENT.telefono);
    await page.fill('[data-testid="client-email-input"]', TEST_CLIENT.email);
    await page.fill('[data-testid="client-notes-input"]', TEST_CLIENT.notas);
    
    await page.click('[data-testid="save-client-button"]');
    
    // Verificar éxito
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Cliente creado');
    
    // Verificar que aparece en la lista
    await expect(page.locator(`[data-testid="client-${TEST_CLIENT.nombre}"]`)).toBeVisible();
  });

  test('should search clients by name', async ({ page }) => {
    const searchInput = page.locator('[data-testid="client-search-input"]');
    
    await searchInput.fill('Juan');
    
    // Verificar que se filtran los resultados
    await page.waitForTimeout(500); // Esperar debounce
    
    const clientCards = page.locator('[data-testid^="client-"]');
    await expect(clientCards.first()).toContainText('Juan');
  });

  test('should filter clients by segment', async ({ page }) => {
    await page.selectOption('[data-testid="segment-filter"]', 'vip');
    
    // Verificar que solo se muestran clientes VIP
    const vipBadges = page.locator('[data-testid="vip-badge"]');
    await expect(vipBadges.first()).toBeVisible();
  });

  test('should edit client information', async ({ page }) => {
    const firstClient = page.locator('[data-testid^="client-"]').first();
    await firstClient.click();
    
    await page.click('[data-testid="edit-client-button"]');
    
    // Cambiar teléfono
    await page.fill('[data-testid="client-phone-input"]', '699888777');
    
    await page.click('[data-testid="save-changes-button"]');
    
    // Verificar actualización
    await expect(page.locator('[data-testid="client-phone"]')).toContainText('699888777');
  });
});

test.describe('Dashboard and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verificar widgets principales
    await expect(page.locator('[data-testid="reservations-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="occupancy-rate"]')).toBeVisible();
    
    // Verificar que los números son válidos
    const reservationsCount = await page.locator('[data-testid="reservations-count"]').textContent();
    expect(parseInt(reservationsCount || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('[data-testid="nav-analytics"]');
    await page.waitForURL(`${BASE_URL}/analytics`);
    
    // Verificar que se cargan los gráficos
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservations-chart"]')).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    await page.click('[data-testid="nav-analytics"]');
    
    // Cambiar rango de fechas
    await page.click('[data-testid="date-range-picker"]');
    await page.click('[data-testid="last-7-days"]');
    
    // Verificar que se actualizan los datos
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="date-range-display"]')).toContainText('Últimos 7 días');
  });
});

test.describe('Responsive Design', () => {
  test('should work correctly on mobile devices', async ({ page }) => {
    // Simular viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await login(page);
    
    // Verificar navegación móvil
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
    
    // Navegar usando menú móvil
    await page.click('[data-testid="mobile-menu-button"]');
    await page.click('[data-testid="mobile-nav-reservations"]');
    
    await expect(page).toHaveURL(`${BASE_URL}/reservations`);
  });

  test('should adapt table grid for tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await login(page);
    await page.click('[data-testid="nav-tables"]');
    
    // Verificar layout tablet
    const tableGrid = page.locator('[data-testid="table-grid"]');
    await expect(tableGrid).toHaveClass(/grid-cols-4/); // Tablet layout
  });
});

test.describe('Performance', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    await login(page);
    
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Verificar que carga en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large reservation lists efficiently', async ({ page }) => {
    await login(page);
    await page.click('[data-testid="nav-reservations"]');
    
    // Simular carga de muchas reservas
    await page.route('**/api/reservations**', async route => {
      const largeMockData = {
        success: true,
        reservations: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          cliente_nombre: `Cliente ${i + 1}`,
          fecha_reserva: '2024-12-25',
          hora_reserva: '14:00',
          numero_personas: 2,
          estado: 'confirmada'
        }))
      };
      await route.fulfill({ json: largeMockData });
    });
    
    await page.reload();
    
    // Verificar que se renderiza sin bloquear la UI
    await expect(page.locator('[data-testid="reservations-list"]')).toBeVisible();
    
    // Verificar scroll virtual o paginación
    const reservationItems = page.locator('[data-testid^="reservation-"]');
    const visibleCount = await reservationItems.count();
    expect(visibleCount).toBeLessThanOrEqual(50); // Debe limitar items visibles
  });
});

test.describe('Accessibility', () => {
  test('should be navigable with keyboard only', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Navegar usando solo Tab y Enter
    await page.keyboard.press('Tab'); // Email input
    await page.keyboard.type(TEST_USER_EMAIL);
    
    await page.keyboard.press('Tab'); // Password input
    await page.keyboard.type(TEST_USER_PASSWORD);
    
    await page.keyboard.press('Tab'); // Login button
    await page.keyboard.press('Enter');
    
    // Verificar que el login funcionó
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await login(page);
    await page.click('[data-testid="nav-reservations"]');
    
    // Verificar ARIA labels en elementos importantes
    await expect(page.locator('[aria-label="Crear nueva reserva"]')).toBeVisible();
    await expect(page.locator('[aria-label="Lista de reservas"]')).toBeVisible();
    await expect(page.locator('[aria-label="Buscar reservas"]')).toBeVisible();
  });

  test('should support screen reader navigation', async ({ page }) => {
    await login(page);
    
    // Verificar landmarks ARIA
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    
    // Verificar headings jerárquicos
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    const h2 = page.locator('h2').first();
    if (await h2.isVisible()) {
      // Verificar que h2 viene después de h1 en el orden de lectura
      const h1Box = await h1.boundingBox();
      const h2Box = await h2.boundingBox();
      expect(h2Box?.y).toBeGreaterThan(h1Box?.y || 0);
    }
  });
});

test.describe('Cross-browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async () => {
      const browser = await (browserName === 'chromium' ? chromium : 
                            browserName === 'firefox' ? firefox : webkit).launch();
      const page = await browser.newPage();
      
      try {
        await login(page);
        
        // Test funcionalidad básica
        await page.click('[data-testid="nav-reservations"]');
        await expect(page).toHaveURL(`${BASE_URL}/reservations`);
        
        await page.click('[data-testid="nav-tables"]');
        await expect(page).toHaveURL(`${BASE_URL}/tables`);
        
      } finally {
        await browser.close();
      }
    });
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await login(page);
    
    // Simular error de red
    await page.route('**/api/reservations**', route => route.abort());
    
    await page.click('[data-testid="nav-reservations"]');
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle API errors with proper user feedback', async ({ page }) => {
    await login(page);
    
    // Simular error 500 del servidor
    await page.route('**/api/reservations**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.click('[data-testid="nav-reservations"]');
    
    // Verificar manejo del error
    await expect(page.locator('[data-testid="error-banner"]')).toContainText('Error del servidor');
  });
});