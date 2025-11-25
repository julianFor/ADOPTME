# 📋 Plan de Instalación Completo - Proyecto ADOPTME

## 📌 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Clonar e Instalar Dependencias](#clonar-e-instalar-dependencias)
3. [Configurar Backend](#configurar-backend)
4. [Configurar Frontend](#configurar-frontend)
5. [Arrancar Servicios (Desarrollo)](#arrancar-servicios-desarrollo)
6. [Ejecutar Tests](#ejecutar-tests)
7. [Build para Producción](#build-para-producción)
8. [MongoDB (Opciones)](#mongodb-opciones)
9. [Cloudinary (Configuración)](#cloudinary-configuración)
10. [Despliegue](#despliegue)
11. [Verificación y Endpoints](#verificación-y-endpoints)
12. [Resolución de Problemas](#resolución-de-problemas)
13. [Checklist Final](#checklist-final)

---

## 🔧 Requisitos Previos

### Software necesario:
- **Node.js**: v16 o superior (se recomienda versión LTS)
- **npm**: v8 o superior (incluido con Node.js)
- **Git**: para clonar el repositorio
- **MongoDB**: versión 5.0+ (local o MongoDB Atlas)
- **Cuenta Cloudinary**: para almacenamiento de imágenes (gratis con plan básico)
- **Opcional**: Docker y Docker Compose

### Verificar instalaciones:
```powershell
node --version
npm --version
git --version
```

---

## 📥 Clonar e Instalar Dependencias

### 1. Clonar el repositorio
```powershell
git clone <URL-del-repositorio>
cd ADOPTME
git checkout Testeos-backend
```

### 2. Instalar dependencias de la raíz (opcional)
```powershell
npm install
```

### 3. Instalar dependencias del backend
```powershell
cd backend
npm install
cd ..
```

### 4. Instalar dependencias del frontend
```powershell
cd frontend
npm install
cd ..
```

---

## ⚙️ Configurar Backend

### 1. Crear archivo `.env` en el directorio `backend/`

```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/adoptme
JWT_SECRET=tu_jwt_secreto_muy_seguro_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
EMAIL_USER=tu_email@dominio.com
EMAIL_PASSWORD=tu_password_de_email
PORT=5000
NODE_ENV=development
```

### 2. Notas importantes:

- **MONGODB_URI**: 
  - Usa `mongodb://localhost:27017/adoptme` para MongoDB local
  - Para MongoDB Atlas, reemplaza con tu URI: `mongodb+srv://usuario:password@cluster.mongodb.net/adoptme`
  
- **JWT_SECRET**: Usa una cadena larga y segura (mínimo 32 caracteres)
  ```powershell
  # Genera una segura en PowerShell:
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
  ```

- **Cloudinary**: Obtén valores desde https://cloudinary.com/console

- **Email**: Si usas Gmail, habilita "Contraseñas de aplicación"

### 3. Seguridad
- ⚠️ **NO subir `.env` al repositorio**
- Verifica que `backend/.env` está en `.gitignore`
- Usa contraseñas fuertes y únicas

---

## 🎨 Configurar Frontend

### 1. Crear archivo `.env.local` en el directorio `frontend/`

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:5000
```

### 2. Alternativas para desarrollo/producción:

```bash
# frontend/.env.development
VITE_API_URL=http://localhost:5000

# frontend/.env.production
VITE_API_URL=https://api.adoptme.com
```

### 3. Verificar que `.env.local` está en `.gitignore`

---

## 🚀 Arrancar Servicios (Desarrollo)

### Terminal 1 - Backend (Node.js)

```powershell
cd backend
npm start
```

**Salida esperada:**
```
Server running on port 5000
MongoDB connected
```

### Terminal 2 - Frontend (Vite)

```powershell
cd frontend
npm run dev
```

**Salida esperada:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Acceder a la aplicación:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🧪 Ejecutar Tests

### Desde la raíz del proyecto:
```powershell
npm test
```

### Tests unitarios:
```powershell
npm run test:unit
```

### Tests de integración:
```powershell
npm run test:integration
```

### Cobertura de tests:
```powershell
npm run test:coverage
```

### Modo watch (reinicia al cambiar archivos):
```powershell
npm run test:watch
```

### Debug de tests:
```powershell
npm run test:debug
```

### Todos los scripts disponibles:
```bash
"test": "jest --forceExit --colors"
"test:unit": "jest __tests__/unit/ --forceExit --colors"
"test:integration": "jest __tests__/integration/ --forceExit --colors"
"test:watch": "jest --watch --colors"
"test:coverage": "jest --coverage --forceExit --colors"
"test:verbose": "jest --verbose --forceExit --colors"
"test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
"test:ci": "jest --coverage --ci --maxWorkers=2"
```

---

## 📦 Build para Producción

### Frontend - Generar bundle optimizado
```powershell
cd frontend
npm run build
```

**Salida**: carpeta `dist/` lista para desplegar

### Backend - Preparar para producción
```powershell
cd backend
# Verificar que NODE_ENV=production en .env
npm install --production
```

**O usar PM2 para mantener el proceso activo:**
```powershell
npm install -g pm2
pm2 start server.js --name "adoptme-backend"
pm2 startup
pm2 save
```

---

## 🗄️ MongoDB (Opciones)

### Opción 1: MongoDB Local (Windows)

**Descargar e instalar:**
- https://www.mongodb.com/try/download/community

**Iniciar servicio MongoDB:**
```powershell
# Si lo instalaste como servicio
net start MongoDB

# O ejecutar manualmente
mongod --dbpath "C:\data\db"
```

**Verificar conexión:**
```powershell
mongo mongodb://localhost:27017/adoptme
```

### Opción 2: MongoDB Atlas (Cloud - Recomendado)

1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Crear usuario de base de datos
4. Obtener connection string: `mongodb+srv://usuario:password@cluster.mongodb.net/adoptme`
5. Pegar en `backend/.env` en `MONGODB_URI`

### Opción 3: MongoDB con Docker

```powershell
# Descargar y ejecutar imagen MongoDB
docker run -d `
  -p 27017:27017 `
  --name adoptme-mongo `
  -e MONGO_INITDB_DATABASE=adoptme `
  mongo:6

# Detener contenedor
docker stop adoptme-mongo

# Reiniciar contenedor
docker start adoptme-mongo
```

---

## 📸 Cloudinary (Configuración)

### Pasos rápidos:

1. **Crear cuenta gratis en** https://cloudinary.com/users/register/free
2. **Ir a Dashboard** y obtener:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. **Generar Access Token** (seguridad adicional):
   - En Dashboard → Settings → Security
4. **Pegar en `backend/.env`:**
   ```bash
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

### Límites del plan gratis:
- 25 créditos/mes
- Almacenamiento ilimitado
- Transformaciones ilimitadas
- Perfecto para proyectos pequeños/medianos

---

## 🌐 Despliegue

### Backend - Opciones de hosting:

#### Opción 1: Heroku (Simple)
```powershell
heroku login
heroku create adoptme-backend
heroku config:set MONGODB_URI=<tu-mongodb-uri>
heroku config:set JWT_SECRET=<tu-jwt-secret>
git push heroku main
```

#### Opción 2: Render (Gratis)
- https://render.com
- Conectar repositorio GitHub
- Configurar variables de entorno
- Deploy automático

#### Opción 3: DigitalOcean (VPS)
```powershell
# En tu servidor
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone <tu-repo>
cd adoptme/backend
npm install
npm start
```

### Frontend - Opciones de hosting:

#### Opción 1: Netlify (Recomendado)
```powershell
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

#### Opción 2: Vercel
```powershell
npm install -g vercel
cd frontend
vercel --prod
```

#### Opción 3: GitHub Pages
```powershell
cd frontend
npm run build
# Subir carpeta dist/ a GitHub Pages
```

### Checklist de despliegue:
- [ ] Todas las variables de entorno configuradas
- [ ] MongoDB URI apunta a Atlas
- [ ] CORS configurado correctamente
- [ ] Cloudinary con credenciales válidas
- [ ] Tests pasando en ambiente de producción
- [ ] HTTPS habilitado
- [ ] Variables sensibles NO en repositorio

---

## ✅ Verificación y Endpoints

### Verificar que backend está corriendo:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -ErrorAction SilentlyContinue
$response
```

### Probar endpoint de autenticación:
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Con curl (si tienes Git Bash):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Endpoints documentados (desde controllers):
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/mascotas` - Listar mascotas
- `POST /api/mascotas` - Crear mascota
- `GET /api/donaciones` - Listar donaciones
- Revisar `backend/routes/` para más endpoints

---

## 🔧 Resolución de Problemas

### ❌ Error: "ECONNREFUSED - Connection refused"
**Causa**: MongoDB no está corriendo
**Solución**:
```powershell
# Verificar si MongoDB está corriendo
Get-Service MongoDB -ErrorAction SilentlyContinue

# Si no está, iniciar:
Start-Service MongoDB

# O ejecutar manualmente:
mongod --dbpath "C:\data\db"
```

### ❌ Error: "Port already in use"
**Causa**: Puerto 5000 ya está siendo usado
**Solución**:
```powershell
# Encontrar proceso en puerto 5000
netstat -ano | findstr :5000

# Matar proceso (reemplaza PID)
Stop-Process -Id <PID> -Force

# Cambiar puerto en backend/.env:
PORT=5001
```

### ❌ Error: "Cannot find module 'express'"
**Causa**: Dependencias no instaladas
**Solución**:
```powershell
cd backend
rm -r node_modules
npm cache clean --force
npm install
```

### ❌ Error: "CORS error - cross-origin blocked"
**Causa**: Frontend y backend con dominios diferentes
**Solución**: Verificar `backend/server.js` o configuración CORS
```javascript
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
```

### ❌ Error: "Cloudinary authentication failed"
**Causa**: Credenciales incorrectas
**Solución**:
```powershell
# Verificar en backend/.env
# Revisar valores en https://cloudinary.com/console
# Usar echo para confirmar valores:
echo $env:CLOUDINARY_CLOUD_NAME
```

### ❌ Tests fallan
**Solución**:
```powershell
cd backend
npm run test:verbose

# Si aún fallan, ejecutar con debug:
npm run test:debug
# Luego abrir chrome://inspect
```

### ❌ Frontend no se conecta al backend
**Causa**: `VITE_API_URL` incorrecta o backend caído
**Solución**:
```powershell
# Verificar frontend/.env.local existe
cat frontend\.env.local

# Confirmar backend está corriendo:
curl http://localhost:5000

# Revisar consola del navegador (F12) para errores CORS
```

---

## ✔️ Checklist Final

Antes de usar el proyecto en desarrollo o desplegar a producción:

### Configuración
- [ ] Node.js v16+ instalado
- [ ] npm v8+ instalado
- [ ] Git configurado
- [ ] MongoDB accesible (local o Atlas)
- [ ] Cuenta Cloudinary creada y credenciales obtenidas

### Backend
- [ ] `backend/.env` creado
- [ ] Todas las variables de entorno rellenadas
- [ ] `backend/.env` añadido a `.gitignore`
- [ ] `npm install` ejecutado en `backend/`
- [ ] `npm start` arranca sin errores
- [ ] Conectado a MongoDB (revisar logs)

### Frontend
- [ ] `frontend/.env.local` creado (si es necesario)
- [ ] `VITE_API_URL` apunta a backend correcto
- [ ] `npm install` ejecutado en `frontend/`
- [ ] `npm run dev` arranca sin errores
- [ ] Conecta y consume API del backend

### Tests
- [ ] `npm test` ejecuta sin errores
- [ ] Cobertura aceptable: `npm run test:coverage`
- [ ] Tests unitarios pasan: `npm run test:unit`
- [ ] Tests de integración pasan: `npm run test:integration`

### Seguridad
- [ ] JWT_SECRET es fuerte y único
- [ ] Credenciales Cloudinary válidas
- [ ] No hay credenciales en repositorio
- [ ] `.env` y `.env.local` en `.gitignore`
- [ ] Cors configurado correctamente

### Antes de producción
- [ ] Build frontend sin errores: `npm run build`
- [ ] NODE_ENV=production en backend
- [ ] HTTPS habilitado en servidor
- [ ] MongoDB usando conexión segura (SSL/TLS)
- [ ] Todas las pruebas verdes
- [ ] Variables de entorno configuradas en servidor

---

## 📞 Soporte y Referencias

- **Node.js**: https://nodejs.org/
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Mongoose**: https://mongoosejs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Cloudinary**: https://cloudinary.com/documentation
- **Vite**: https://vitejs.dev/

---

**Última actualización**: 25 de noviembre de 2025
**Versión**: 1.0
**Proyecto**: ADOPTME
**Rama**: Testeos-backend
