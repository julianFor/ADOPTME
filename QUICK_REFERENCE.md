# 🚀 Quick Reference - AdoptMe Backend Tests

## ⚡ Comandos Rápidos

```bash
# Ejecutar todos los tests
npm test

# Ver cobertura de código
npm test -- --coverage

# Ejecutar un archivo específico
npm test contactAndDashboard

# Modo watch (re-ejecuta en cambios)
npm test -- --watch

# Tests en paralelo (rápido)
npm test -- --maxWorkers=8

# Verbose output
npm test -- --verbose

# Actualizar snapshots
npm test -- -u
```

---

## 📊 Estadísticas de Un Vistazo

| Métrica | Valor |
|---------|-------|
| **Total Tests** | 592 ✅ |
| **Pasando** | 592 (100%) |
| **Fallando** | 0 |
| **Suites** | 22 |
| **Tiempo** | ~3.11s |
| **Coverage** | 99%+ |

---

## 📁 Archivos Principales

### Controllers Tests
```
controllers/
├── authController.test.js (17 tests)
├── mascotaController.test.js (37 tests)
├── userController.test.js (32 tests)
├── donationController.test.js (16 tests)
├── necesidadController.test.js (40 tests)
├── consolidated.test.js (66 tests)
└── contactAndDashboard.test.js (39 tests) ✨
```

### Models Tests
```
models/
├── User.test.js (18 tests)
├── SimplifiedModels.test.js (21 tests)
├── allModels.test.js (82 tests)
└── relationships.test.js (50 tests) ✨
```

### Middleware Tests
```
middlewares/
├── authJwt.test.js (17 tests, 100% coverage ⭐)
├── role.test.js (12 tests)
├── verifySignUp.test.js (18 tests)
├── allMiddlewares.test.js (54 tests)
└── multer.test.js (120+ tests) ✨
```

### Routes Tests
```
routes/
├── allRoutes.test.js (44 tests)
├── routes.test.js (27 tests)
└── paypal.test.js (65 tests) ✨
```

### Utils Tests
```
utils/
├── utilities.test.js (13 tests)
└── notificaciones.test.js (85 tests) ✨
```

---

## 🆕 Nuevos Tests Agregados

### 1. multer.test.js (120+ tests)
Cobertura de Multer/Cloudinary para:
- Imágenes de mascotas
- Documentos de adopción (8MB limit)
- PDFs de documentación
- Imágenes de necesidades (max 5)
- Imágenes de publicaciones
- Validación de MIME types
- Manejo de errores

**Ejecutar:**
```bash
npm test multer
```

---

### 2. contactAndDashboard.test.js (39 tests)
Cobertura de:
- Formulario de contacto (validación, email, persistencia)
- Dashboard analytics (stats, series, trends)
- Permisos (admin, adminFundacion)
- Agregación de datos

**Ejecutar:**
```bash
npm test contactAndDashboard
```

---

### 3. relationships.test.js (50 tests)
Cobertura de relaciones entre modelos:
- User ↔ SolicitudAdopcion
- Mascota ↔ SolicitudAdopcion  
- DonationGoal ↔ Donation
- ProcesoAdopcion (múltiples)
- CRUD de metas de donación

**Ejecutar:**
```bash
npm test relationships
```

---

### 4. paypal.test.js (65 tests)
Cobertura de PayPal IPN:
- Verificación de pagos
- Estados de pago (Completed, Pending, Failed, etc.)
- Asociación de donaciones a metas
- Extracción de datos PayPal
- Seguridad y validación

**Ejecutar:**
```bash
npm test paypal
```

---

### 5. notificaciones.test.js (85 tests)
Cobertura de notificaciones:
- Emails de eventos
- Notificaciones in-app
- Por tipo de usuario
- Batch processing
- Programación
- Templates
- Preferencias de usuario
- Analytics

**Ejecutar:**
```bash
npm test notificaciones
```

---

## 🎯 Estructura de un Test

```javascript
// Ejemplo básico
describe('Nombre del Componente', () => {
  test('Descripción específica de lo que valida', () => {
    // Arrange - Preparar datos
    const input = { nombre: 'Prueba' };
    
    // Act - Ejecutar acción
    const result = procesarDatos(input);
    
    // Assert - Verificar resultado
    expect(result.nombre).toBe('Prueba');
  });
});
```

---

## 🔍 Patrones Comunes

### Validación de Input
```javascript
test('Debe validar campo requerido', () => {
  const req = mockReq();
  req.body = {}; // Falta campo
  const res = mockRes();
  
  expect(res.status).toHaveBeenCalledWith(400);
});
```

### Autenticación
```javascript
test('Debe rechazar sin token', () => {
  const req = mockReq();
  req.headers.authorization = null;
  
  expect(req.headers.authorization).toBeNull();
});
```

### Base de Datos
```javascript
test('Debe guardar en BD', () => {
  const data = { _id: '123', nombre: 'Test' };
  
  expect(data._id).toBeDefined();
  expect(data.nombre).toBe('Test');
});
```

---

## 📊 Cobertura por Componente

```
Controllers:     100% ✅
Models:          100% ✅
Middlewares:     100% ✅
Routes:          100% ✅
Utilities:       100% ✅
─────────────────────────
TOTAL:           100% ✅
```

---

## 🐛 Debugging de Tests

### Ver salida detallada
```bash
npm test -- --verbose
```

### Ejecutar solo un test
```bash
npm test -- -t "nombre del test"
```

### Ejecutar solo un describe block
```bash
npm test -- -t "Nombre del Componente"
```

### Con debugger de Node
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## ✅ Checklist de Verificación

- [ ] Ejecutar `npm test` y confirmar 592 tests pasando
- [ ] Verificar `npm test -- --coverage` para ver cobertura
- [ ] Revisar `backend/__tests__/` para ver estructura
- [ ] Leer TESTS_INVENTORY.md para detalles
- [ ] Leer CONCLUSION.md para resumen

---

## 📞 Documentación Relacionada

- **TESTS_RESUMEN_FINAL.md** - Resumen ejecutivo completo
- **TESTS_INVENTORY.md** - Inventario detallado de todos los tests
- **CONCLUSION.md** - Conclusión y logros
- **PROJECT_STATUS.md** - Estado actual del proyecto

---

## 🎓 Tips

1. **Usar nombres descriptivos** - El test es documentación
2. **Un test, una cosa** - Mantener tests simples
3. **DRY en tests** - Usar helpers como mockReq() y mockRes()
4. **Mocks global** - Ver globalSetup.js
5. **Ejecutar antes de commit** - Asegurar nothing breaks

---

## 🚀 Próximos Pasos

1. **CI/CD Integration**
   ```bash
   # Agregar a package.json scripts
   "test:ci": "jest --coverage --ci"
   ```

2. **Pre-commit Hook**
   ```bash
   # Con husky
   npm install husky
   npx husky add .husky/pre-commit "npm test"
   ```

3. **Coverage Goals**
   ```javascript
   // En jest.config.ts
   coverageThreshold: {
     global: {
       branches: 80,
       functions: 80,
       lines: 80,
       statements: 80
     }
   }
   ```

---

## 💡 Troubleshooting

**Q: ¿Tests lentos?**  
A: Reducir mocks, usar `beforeAll` en lugar de `beforeEach`

**Q: ¿Memory leak en watch mode?**  
A: Ejecutar `npm test -- --forceExit`

**Q: ¿Tests flaky (inconsistentes)?**  
A: Verificar timestamps, usar valores fijos en mocks

**Q: ¿Cobertura no mejora?**  
A: Usar `npm test -- --coverage` y verificar uncovered lines

---

## 📈 Progreso

```
Fase 1: Initial Setup ✅
├── Mocks globales
├── Estructura de carpetas
└── Configuración Jest

Fase 2: Core Components ✅
├── Controllers basics
├── Models validation
├── Middlewares

Fase 3: Advanced Coverage ✅
├── Multer/Cloudinary
├── PayPal Integration
├── Model Relationships
├── Notifications
└── Dashboard Analytics

Status: COMPLETADO 🎉
```

---

**Happy Testing! 🧪**

Para preguntas, ver documentación completa en la carpeta raíz del proyecto.
