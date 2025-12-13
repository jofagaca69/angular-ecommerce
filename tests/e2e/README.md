# Pruebas E2E con Playwright

Este directorio contiene las pruebas end-to-end (E2E) del proyecto, implementadas usando Playwright.

## 📚 Basado en Lab 3: Functional Verification at System Level

Las pruebas están diseñadas siguiendo los principios del Laboratorio 3:
- **Verificación funcional a nivel de sistema**: Validar que el sistema completo se comporta según los requisitos funcionales formales
- **Enfoque en requisitos**: Las pruebas validan cumplimiento de especificaciones, no satisfacción del usuario
- **Análisis sistemático**: Distinguir entre defectos de implementación, requisitos o casos de prueba

## 🏗️ Estructura

```
tests/e2e/
├── pages/           # Page Object Models (POM)
│   ├── login.page.ts
│   ├── home.page.ts
│   └── cart.page.ts
├── fixtures/        # Fixtures y datos de prueba
│   └── test-data.ts
├── login.spec.ts    # Tests de login (FR-01 a FR-04)
├── purchase.spec.ts # Tests de flujo de compra
└── README.md        # Este archivo
```

## 📋 Requisitos Funcionales Implementados

### FR-01: Página de Login
El sistema debe proporcionar una página de login con campos para teléfono y contraseña.

### FR-02: Autenticación
Cuando se proporcionan credenciales válidas, el sistema debe autenticar al usuario.

### FR-03: Redirección
Tras la autenticación, el sistema debe redirigir al usuario al Dashboard.

### FR-04: Manejo de Errores
Si las credenciales son inválidas, el sistema debe mostrar un mensaje de error sin redirigir.

## 🚀 Ejecución

### Prerequisitos

1. **Servidor de desarrollo corriendo**: El servidor Angular debe estar ejecutándose en `http://localhost:4200`
2. **Backend disponible**: Los microservicios deben estar corriendo (ver `nodejs-ecommerce-microservice/README.md`)
3. **Usuario de prueba**: Debe existir un usuario válido en el sistema para los tests de login exitoso

### Comandos

```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar con interfaz gráfica (recomendado para desarrollo)
npm run test:e2e:ui

# Ejecutar en modo headed (ver el navegador)
npm run test:e2e:headed

# Ejecutar en modo debug (paso a paso)
npm run test:e2e:debug

# Ver reporte HTML de pruebas anteriores
npm run test:e2e:report
```

## 📝 Page Object Model (POM)

Se utiliza el patrón Page Object Model para mantener los tests limpios y mantenibles:

### LoginPage
```typescript
import { LoginPage } from './pages/login.page';

const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('3214', '3214');
```

### HomePage
```typescript
import { HomePage } from './pages/home.page';

const homePage = new HomePage(page);
await homePage.goto();
await homePage.addFirstProductToCart();
```

### CartPage
```typescript
import { CartPage } from './pages/cart.page';

const cartPage = new CartPage(page);
await cartPage.goto();
await cartPage.proceedToPurchase();
```

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts` en la raíz del proyecto.

### Características principales:
- **Auto-start del servidor**: Playwright inicia automáticamente `ng serve` antes de los tests
- **Múltiples navegadores**: Configurado para Chromium (extensible a Firefox y WebKit)
- **Screenshots y videos**: Se capturan automáticamente en caso de fallo
- **Traces**: Se guardan para debugging en reintentos

## 📊 Reportes

Después de ejecutar las pruebas, puedes ver:
- **Reporte HTML**: `npm run test:e2e:report`
- **Screenshots**: En `test-results/` (solo en fallos)
- **Videos**: En `test-results/` (solo en fallos)
- **Traces**: Para debugging interactivo

## 🐛 Debugging

### Modo Debug
```bash
npm run test:e2e:debug
```
Abre Playwright Inspector para ejecutar paso a paso.

### Ver logs
Los tests muestran logs en consola. Para más detalle:
```bash
DEBUG=pw:api npm run test:e2e
```

### Screenshots y videos
Se guardan automáticamente en `test-results/` cuando un test falla.

## 📌 Notas Importantes

1. **Keypad numérico**: El sistema usa un keypad personalizado. El Page Object maneja la interacción con este componente.

2. **Credenciales de prueba**: Los tests asumen que existe un usuario válido. En CI/CD, esto debe configurarse en el setup.

3. **Tiempos de espera**: Los tests incluyen timeouts apropiados para esperar navegación y respuestas del servidor.

4. **Aislamiento**: Cada test es independiente. Si necesitas estado compartido, usa fixtures.

## 📦 Tests Disponibles

### login.spec.ts
Tests de funcionalidad de login basados en Lab 3:
- FR-01: Verificación de página de login
- FR-02: Autenticación con credenciales válidas
- FR-03: Redirección después de login
- FR-04: Manejo de errores con credenciales inválidas

### purchase.spec.ts
Tests del flujo completo de compra:
- ✅ Flujo completo: login -> agregar producto -> comprar
- ✅ Compra sin autenticación (redirección a login)
- ✅ Agregar múltiples productos al carrito
- ✅ Actualizar cantidad en el carrito
- ✅ Eliminar productos del carrito

## 🔄 Próximos Pasos

- [ ] Agregar tests para registro de usuarios
- [x] Agregar tests para carrito de compras
- [ ] Agregar tests para dashboard de administrador
- [x] Implementar fixtures para datos de prueba

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [Lab 3: Functional Verification at System Level](./../../labs/Lab3.md)
- [README del Proyecto](./../../README_PROYECTO.md)

