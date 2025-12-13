/**
 * Datos de prueba para los tests E2E
 * 
 * NOTA: Estos datos deben corresponder con usuarios reales en el sistema de pruebas.
 * En un entorno de CI/CD, estos usuarios deben crearse en el setup de los tests.
 */

export const TestUsers = {
  /**
   * Usuario cliente válido para pruebas de login
   * Debe existir en la base de datos de pruebas
   */
  validClient: {
    phone: '3214',
    password: '3214',
    username: '3214', // El sistema usa el teléfono como username
  },

  /**
   * Usuario administrador válido
   */
  validAdmin: {
    phone: '9876543210',
    password: 'admin123',
    username: '9876543210',
  },

  /**
   * Credenciales inválidas para pruebas de error
   */
  invalid: {
    phone: '9999999999',
    password: '000000',
  },
} as const;

/**
 * URLs del sistema
 */
export const Routes = {
  login: '/login',
  register: '/register',
  home: '/home',
  dashboard: '/dashboard',
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  cart: '/cart',
} as const;

/**
 * Timeouts para esperas en tests
 */
export const Timeouts = {
  navigation: 5000, // 5 segundos para navegación
  api: 3000, // 3 segundos para respuestas de API
  ui: 2000, // 2 segundos para interacciones UI
} as const;

