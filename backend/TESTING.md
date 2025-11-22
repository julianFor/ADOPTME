# 📋 Guía de Testing - Backend AdoptMe

Este documento explica cómo ejecutar y entender los tests del backend de AdoptMe usando Jest.

## 🚀 Inicio Rápido

### 1. Instalar dependencias (si aún no lo has hecho)
```bash
npm install
```

### 2. Ejecutar todos los tests
```bash
npm test
```

### 3. Ver resultados detallados
```bash
npm run test:verbose
```

### 4. Ver cobertura de código
```bash
npm run test:coverage
```

### 5. Modo watch (tests se ejecutan automáticamente al guardar)
```bash
npm run test:watch
```

---

## 📁 Estructura de Tests

```
__tests__/
├── unit/                          # Pruebas unitarias (componentes aislados)
│   ├── controllers/
│   │   ├── authController.test.js
│   │   └── userController.test.js
│   ├── models/
│   │   └── User.test.js
│   └── utils/
│       └── sanitize.test.js
│
└── integration/                   # Pruebas de integración (múltiples componentes)
    └── auth.test.js
```

---

## 📝 Tipos de Tests Creados

### 1. **Tests Unitarios** (`__tests__/unit/`)

#### `utils/sanitize.test.js`
Prueba funciones de sanitización:
- ✅ Validación de IDs de MongoDB
- ✅ Sanitización de parámetros de consulta
- ✅ Sanitización de datos para actualización
- ✅ Rechazo de caracteres maliciosos

**Ejecutar solo este archivo:**
```bash
npm test sanitize.test.js
```

#### `models/User.test.js`
Prueba el esquema y métodos del modelo User:
- ✅ Validación de campos requeridos
- ✅ Roles válidos
- ✅ Comparación de contraseñas
- ✅ Hasheo de contraseñas
- ✅ Validación de emails

**Ejecutar solo este archivo:**
```bash
npm test User.test.js
```

#### `controllers/authController.test.js`
Prueba el controlador de autenticación:
- ✅ Registro de usuarios
- ✅ Login con email y password
- ✅ Obtener usuario por ID
- ✅ Eliminar usuario
- ✅ Validación de permisos
- ✅ Manejo de errores

**Ejecutar solo este archivo:**
```bash
npm test authController.test.js
```

#### `controllers/userController.test.js`
Prueba el controlador de usuarios:
- ✅ Registro público de adoptantes
- ✅ Obtener todos los usuarios
- ✅ Obtener usuario por ID
- ✅ Crear usuario
- ✅ Actualizar usuario
- ✅ Eliminar usuario
- ✅ Control de roles y permisos

**Ejecutar solo este archivo:**
```bash
npm test userController.test.js
```

---

### 2. **Tests de Integración** (`__tests__/integration/`)

#### `auth.test.js`
Prueba flujos completos de autenticación:
- ✅ Endpoint POST /api/auth/signup
- ✅ Endpoint POST /api/auth/signin
- ✅ Endpoint GET /api/auth/user/:id
- ✅ Validación de respuestas HTTP
- ✅ Manejo de errores en flujos

**Ejecutar solo este archivo:**
```bash
npm test auth.test.js
```

---

## 🎯 Qué Se Prueba en Cada Controlador

### AuthController
| Función | Pruebas |
|---------|---------|
| **signup** | Registro exitoso, campos faltantes, email duplicado |
| **signin** | Login exitoso, credenciales inválidas, usuario no existe, email inválido |
| **getUserById** | Usuario encontrado, usuario no existe, verificación de permisos |
| **deleteUser** | Admin puede eliminar, no-admin no puede, usuario no existe |

### UserController
| Función | Pruebas |
|---------|---------|
| **registrarse** | Registro exitoso, email/username duplicado, campos faltantes |
| **getAllUsers** | Admin ve todos, adminFundacion ve sus usuarios, otros denegados |
| **getUserById** | ID válido, ID inválido, permisos, usuario no existe |
| **createUser** | Crear con todos los campos |
| **updateUser** | Admin actualiza, validación de ID, permisos |
| **deleteUser** | Admin puede eliminar, otros denegados, usuario no existe |
| **getMiPerfil** | Obtener perfil del usuario autenticado |

---

## 📊 Cobertura de Tests

Para ver qué porcentaje de tu código está cubierto por tests:

```bash
npm run test:coverage
```

Esto genera un reporte con:
- **Statements**: Líneas de código ejecutadas
- **Branches**: Caminos condicionales cubiertos
- **Functions**: Funciones testeadas
- **Lines**: Líneas testeadas

El reporte se guarda en `coverage/` con un archivo HTML para visualizar mejor.

---

## 🔧 Mocks Utilizados

Los tests usan **mocks** para simular dependencias sin necesidad de una base de datos real:

```javascript
jest.mock('../../../models/User');  // Simula el modelo User
jest.mock('jsonwebtoken');          // Simula JWT
jest.mock('bcryptjs');              // Simula bcrypt
```

### Beneficios:
- ⚡ Tests rápidos (sin conectar a MongoDB)
- 🔒 Tests aislados (sin afectar datos reales)
- 🎯 Fácil de controlar (puedes simular cualquier respuesta)

---

## 🧪 Anatomía de un Test

```javascript
describe('Controller - Auth', () => {        // Suite de tests
  let req, res;

  beforeEach(() => {                         // Se ejecuta antes de cada test
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('debe registrar un usuario correctamente', async () => {  // Test individual
    // Arrange: Preparar datos
    req.body = { username: 'user', email: 'user@example.com', password: 'pass' };
    
    // Act: Ejecutar función
    await authController.signup(req, res);
    
    // Assert: Verificar resultado
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });
});
```

---

## 🐛 Debugging Tests

### Ver logs detallados
```bash
npm test -- --verbose
```

### Ejecutar un test específico
```bash
npm test -- --testNamePattern="debe registrar un usuario"
```

### Ejecutar un archivo específico
```bash
npm test -- authController.test.js
```

### Modo interactivo (elige qué tests ejecutar)
```bash
npm run test:watch
```

---

## ✅ Mejores Prácticas

1. **Un test = un concepto**
   - Cada test debe probar una sola cosa
   
2. **Nombres descriptivos**
   - `describe()` para agrupar funcionalidad
   - `test()` con descripción clara en español/inglés

3. **AAA Pattern (Arrange-Act-Assert)**
   - Arrange: Preparar datos
   - Act: Ejecutar la función
   - Assert: Verificar resultados

4. **Limpiar después de cada test**
   - Usar `beforeEach()` para reset
   - Limpiar mocks con `jest.clearAllMocks()`

5. **Async/Await**
   - Usar para operaciones asincrónicas
   - Esperar promesas correctamente

---

## 🚨 Errores Comunes

### Error: "Cannot find module"
```bash
npm install  # Asegúrate de tener todas las dependencias
```

### Error: "Timeout - async test"
```javascript
// Aumentar timeout si es necesario
test('mi test', async () => {
  // ...
}, 10000); // 10 segundos
```

### Error: "Jest encountered an unexpected token"
```javascript
// Asegúrate de que jest.config.js está bien configurado
```

---

## 📈 Próximos Pasos

### Tests a Agregar:
1. ✍️ `mascotaController.test.js` - Gestión de mascotas
2. ✍️ `donationController.test.js` - Donaciones
3. ✍️ `necesidadController.test.js` - Necesidades
4. ✍️ `solicitudAdopcionController.test.js` - Solicitudes de adopción
5. ✍️ `notificacionController.test.js` - Notificaciones

### Mejorar Tests Existentes:
1. Agregar tests de errores más específicos
2. Probar casos edge (límites)
3. Verificar validaciones más exhaustivas
4. Tests de seguridad (inyección SQL, XSS, etc.)

---

## 📚 Recursos Útiles

- **Jest Docs**: https://jestjs.io/
- **Supertest (para rutas)**: https://github.com/visionmedia/supertest
- **Testing Library**: https://testing-library.com/

---

## 🆘 Ayuda

Si tienes problemas con los tests:
1. Revisa los logs de error
2. Usa `npm run test:verbose` para más detalles
3. Verifica que todos los mocks estén configurados
4. Comprueba que las rutas de imports sean correctas

¡Feliz testing! 🎉
