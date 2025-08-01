# Registro de Pasajeros - Metropolitano Chorrillos

Aplicación web para el registro de pasajeros del Metropolitano en la ruta Lima - Chorrillos. Permite a los administradores gestionar rutas y ver el historial de pasajeros, mientras que los pasajeros pueden registrarse, iniciar sesión, seleccionar rutas y ver su historial de viajes.

## Tecnologías Utilizadas

- **Frontend**: HTML, CSS, JavaScript (sin frameworks)
- **Backend**: Node.js + Express
- **Base de Datos**: MySQL
- **Despliegue**: Render (separado frontend/backend)

## Estructura del Proyecto

```
/registro-pasajeros
├── /backend
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rutas.js
│   │   └── registros.js
│   └── controllers/
│       ├── authController.js
│       ├── rutaController.js
│       └── registroController.js
│
├── /frontend
│   ├── index.html        (login)
│   ├── registro.html     (registro)
│   ├── home_admin.html   (panel admin)
│   ├── home_pasajero.html (panel pasajero)
│   ├── rutas.html        (gestión de rutas)
│   ├── historial.html    (ver rutas por pasajero)
│   └── /js
│       ├── login.js
│       ├── registro.js
│       ├── admin.js
│       ├── pasajero.js
│       └── rutas.js
│
└── /sql
    └── base_datos.sql
```

## Instalación y Configuración

### Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8 o superior)

### Despliegue en Render

Este proyecto está configurado para ser desplegado en Render utilizando el archivo `render.yaml`.

#### Pasos para el despliegue:

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Haz clic en "Blueprint" y selecciona el repositorio
4. Render detectará automáticamente el archivo `render.yaml` y configurará los servicios
5. Confirma la configuración y haz clic en "Apply"

Render creará automáticamente:
- Un servicio web para el backend
- Un servicio web para el frontend
- Una base de datos MySQL

La base de datos se inicializará automáticamente gracias al script `initDb.js`.
- MySQL (v5.7 o superior)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd registro-pasajeros
```

2. **Configurar la Base de Datos**

- Crear una base de datos en MySQL
- Importar el archivo `sql/base_datos.sql`

```bash
mysql -u root -p
# Ingresar contraseña
CREATE DATABASE registro_pasajeros;
USE registro_pasajeros;
source sql/base_datos.sql;
```

3. **Configurar el Backend**

```bash
cd backend
npm install
```

4. **Configurar Variables de Entorno (opcional)**

Crear un archivo `.env` en la carpeta `backend` con las siguientes variables:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=registro_pasajeros
```

5. **Iniciar el Servidor**

```bash
npm start
```

6. **Acceder a la Aplicación**

Abrir el navegador y acceder a:
- Frontend: `http://192.168.2.42:8080/frontend` 
- Backend API: `http://192.168.2.42:3000`

## Credenciales por Defecto

- **Administrador**:
  - DNI: 12345678
  - Contraseña: admin123

## Funcionalidades

### Módulo de Administrador

- Ver lista de pasajeros registrados
- Ver historial de rutas de cada pasajero
- Gestionar rutas (agregar/eliminar)
- Ver registros recientes de todos los pasajeros

### Módulo de Pasajero

- Registro de nuevo usuario
- Inicio de sesión
- Selección y registro de rutas
- Visualización de historial personal de rutas

## Despliegue en Render

Este proyecto incluye un conjunto completo de herramientas para verificar y solucionar problemas de despliegue en Render.

### Herramientas de Verificación de Despliegue

```bash
# Verificación completa del despliegue en Render
npm run verify-render

# Verificar configuración de Render
npm run render-info

# Verificar conexión a la base de datos en Render
npm run check-render-db

# Verificar configuración CORS
npm run check-cors

# Verificar configuración de seguridad
npm run check-security

# Verificar rendimiento
npm run check-performance
```

Para instrucciones detalladas sobre el despliegue en Render, consulta el archivo [DEPLOY_RENDER.md](./DEPLOY_RENDER.md).

Si encuentras problemas durante el despliegue o la ejecución en Render, consulta la guía de solución de problemas: [RENDER_TROUBLESHOOTING.md](./RENDER_TROUBLESHOOTING.md).

### Backend

1. Crear un nuevo servicio web en Render
2. Conectar con el repositorio de GitHub
3. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm run check-render-db && node server.js`
   - Agregar variables de entorno para la base de datos

### Frontend

1. Crear un nuevo servicio estático en Render
2. Conectar con el repositorio de GitHub
3. Configurar:
   - Publish directory: `frontend`
   - Actualizar la URL de la API en los archivos JS para que apunte al backend desplegado

## Autor

- Desarrollado para el proyecto de Registro de Pasajeros - Metropolitano Chorrillos