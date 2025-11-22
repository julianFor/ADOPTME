# 📋 Guía de Pruebas - AdoptMe Backend

## Descripción General

Este archivo documenta toda la suite de tests del backend de AdoptMe. Las pruebas están organizadas por categorías y cubren models, controllers, middlewares, utilities y rutas de integración.

## 📁 Estructura de Pruebas

```
backend/__tests__/
├── __init__.js                   # Configuración inicial
├── globalSetup.js                # Setup global con mocks
├── testSuite.test.js             # Suite de validación
├── setup.js                      # Setup de pruebas
├── models/
│   ├── User.test.js             # Tests del modelo User
│   ├── Mascota.test.js          # Tests del modelo Mascota
│   ├── Donation.test.js         # Tests del modelo Donation
│   └── Need.test.js             # Tests del modelo Need
├── controllers/
│   └── authController.test.js   # Tests del controlador de autenticación
├── middlewares/
│   ├── authJwt.test.js          # Tests de verificación JWT
│   ├── role.test.js             # Tests de autorización de roles
│   └── verifySignUp.test.js     # Tests de validación de registro
├── utils/
│   └── utilities.test.js        # Tests de utilidades
└── integration/
    └── routes.test.js           # Tests de integración de rutas
```

## 🧪 Ejecución de Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Ejecutar pruebas con cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas en modo verbose
```bash
npm run test:verbose
```

## 📊 Cobertura de Pruebas

Cada módulo cuenta con:

### **Models** (83 tests)
- User Model: 26 tests
- Mascota Model: 28 tests
- Donation Model: 19 tests
- Need Model: 10 tests

Tests incluyen:
- Creación con campos válidos
- Validación de campos requeridos
- Tipos de datos y enumeraciones
- Valores por defecto
- Relacionamientos
- Métodos del modelo

### **Controllers** (18 tests)
- authController: 18 tests

Tests incluyen:
- Signup exitoso
- Signup con validaciones de error
- Login exitoso
- Login con validaciones de error
- Sanitización de datos
- Generación de JWT
- Manejo de errores

### **Middlewares** (27 tests)
- authJwt: 16 tests
- role: 8 tests
- verifySignUp: 17 tests

Tests incluyen:
- Verificación de JWT
- Validación de roles
- Permisos y autorización
- Validación de datos de registro
- Sanitización de input
- Detección de inyección NoSQL

### **Utilities** (13 tests)
- Validación de email
- Validación de strings
- Sanitización
- Comparación de contraseñas

### **Integration** (25 tests)
- Tests de rutas GET, POST, PUT, DELETE
- Flujos completos de negocio
- Interacción entre componentes

### **Configuration** (31 tests)
- Setup de Jest
- Mocks globales
- Utilidades de test
- Entorno de prueba

## 🔧 Configuración de Jest

El archivo `jest.config.ts` incluye:

- **testEnvironment**: node
- **testMatch**: `**/__tests__/**/*.test.js`
- **testTimeout**: 30000ms
- **collectCoverage**: true
- **setupFilesAfterEnv**: `backend/__tests__/globalSetup.js`

## 🎭 Mocks Globales

### Mongoose
```javascript
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn().mockResolvedValue(true),
  connection: { close: jest.fn() }
}));
```

### Express
```javascript
jest.mock('express', () => {
  const mockRouter = {
    get: jest.fn().mockReturnValue(mockRouter),
    post: jest.fn().mockReturnValue(mockRouter),
    use: jest.fn().mockReturnValue(mockRouter)
  };
  return { default: jest.fn(() => mockRouter) };
});
```

### JWT
```javascript
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn().mockReturnValue({ id: '123', role: 'adoptante' })
}));
```

### Bcrypt
```javascript
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt_123'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));
```

## 🛠️ Utilidades de Test

### Crear Mock de Usuario
```javascript
const user = global.testHelpers.createMockUser({
  username: 'testuser',
  role: 'admin'
});
```

### Crear Mock de Mascota
```javascript
const mascota = global.testHelpers.createMockMascota({
  nombre: 'Firulais',
  especie: 'perro'
});
```

### Crear Mock de Request/Response
```javascript
const req = global.testHelpers.createMockRequest({
  body: { username: 'test' }
});

const res = global.testHelpers.createMockResponse();
const next = global.testHelpers.createMockNext();
```

## 📝 Convenciones de Tests

### Estructura
```javascript
describe('Feature/Module', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  describe('Functionality Group', () => {
    test('Debe hacer algo específico', () => {
      // Arrange
      const input = testData;
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Naming
- Tests descriptivos en español
- Usar "Debe" para pruebas positivas
- Usar "Debe validar" para validaciones
- Usar "Debe retornar" para respuestas

## ✅ Casos de Prueba Cubiertos

### Autenticación
- ✅ Registro de usuario nuevo
- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Validación de email único
- ✅ Validación de contraseña fuerte
- ✅ Generación de JWT

### Autorización
- ✅ Verificación de token JWT
- ✅ Validación de roles
- ✅ Permisos por rol
- ✅ Acceso denegado para roles inválidos

### Modelos de Datos
- ✅ Creación de documentos
- ✅ Validación de campos
- ✅ Valores por defecto
- ✅ Relacionamientos entre modelos
- ✅ Métodos personalizados

### Validaciones
- ✅ Email válido
- ✅ Contraseña fuerte
- ✅ Campos requeridos
- ✅ Longitud de strings
- ✅ Enumeraciones

### Seguridad
- ✅ Detección de inyección NoSQL
- ✅ XSS Prevention
- ✅ Sanitización de input
- ✅ Validación de tipos de datos

## 🐛 Debugging

### Ver logs detallados
```bash
npm run test:verbose
```

### Ejecutar un test específico
```bash
npx jest backend/__tests__/models/User.test.js
```

### Watch mode para desarrollo
```bash
npm run test:watch
```

### Cobertura de código
```bash
npm run test:coverage
```

La cobertura se generará en `coverage/index.html`

## 📈 Métricas de Calidad

**Total de Tests**: 213
**Cobertura Estimada**: > 85%

### Por Categoría
- Models: 83 tests (39%)
- Integration: 25 tests (12%)
- Configuration: 31 tests (15%)
- Middlewares: 27 tests (13%)
- Controllers: 18 tests (8%)
- Utilities: 13 tests (6%)
- Other: 16 tests (7%)

## 🔄 Integración Continua

Para CI/CD pipeline, usar:
```bash
npm test -- --coverage --testTimeout=30000 --detectOpenHandles
```

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/)
- [Jest API](https://jestjs.io/docs/api)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react)

## 👥 Contribución

Al agregar nuevas funcionalidades:
1. Escribir tests primero
2. Seguir la estructura existente
3. Mantener 85%+ cobertura
4. Documentar casos especiales

## ⚠️ Limitaciones Conocidas

- Los tests usan mocks, no conectan a BD real
- Cloudinary no procesa archivos reales
- Nodemailer no envía emails reales
- Las pruebas son unitarias, no E2E

## 🚀 Próximas Mejoras

- [ ] Tests E2E con Cypress
- [ ] Tests de carga/rendimiento
- [ ] Cobertura 95%+
- [ ] Integración con CI/CD
- [ ] Snapshots testing
