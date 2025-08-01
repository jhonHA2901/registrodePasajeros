# Guía de Despliegue en Render

Este documento proporciona instrucciones detalladas para desplegar la aplicación de Registro de Pasajeros en Render.com.

## Requisitos Previos

- Cuenta en [Render.com](https://render.com)
- Repositorio de GitHub con el código de la aplicación
- Git instalado en tu máquina local

## Estructura del Proyecto

El proyecto está configurado para desplegar tres servicios separados en Render:

1. **Base de datos MySQL** (`registrop1-db`)
2. **Backend Node.js** (`registrop1-backend`)
3. **Frontend estático** (`registrop1-frontend`)

## Pasos para el Despliegue

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contenga los siguientes archivos clave:

- `render.yaml` - Define los servicios a desplegar
- `.env.example` - Ejemplo de variables de entorno (no subir el archivo `.env` real)
- `backend/` - Código del servidor Node.js
- `frontend/` - Código del cliente web
- `sql/` - Scripts SQL para inicializar la base de datos

### 2. Conectar Render con GitHub

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com/)
2. Ve a "Blueprints" en el menú lateral
3. Haz clic en "New Blueprint Instance"
4. Conecta tu cuenta de GitHub si aún no lo has hecho
5. Selecciona el repositorio que contiene tu aplicación

### 3. Configurar el Blueprint

1. Render detectará automáticamente el archivo `render.yaml`
2. Revisa los servicios que se van a crear
3. Haz clic en "Apply" para iniciar el despliegue

### 4. Verificar el Despliegue

Render desplegará los servicios en el siguiente orden:

1. Base de datos MySQL
2. Backend Node.js (después de que la base de datos esté lista)
3. Frontend estático (después de que el backend esté listo)

Puedes monitorear el progreso en el dashboard de Render.

### 5. Ejecutar Verificación Completa

Una vez completado el despliegue, ejecuta el script de verificación completa para asegurarte de que todo está configurado correctamente:

```
npm run verify-render
```

Este script realizará una verificación exhaustiva de todos los componentes del despliegue y te proporcionará recomendaciones para resolver cualquier problema detectado.

### 6. Acceder a la Aplicación

Una vez completado el despliegue, podrás acceder a tu aplicación en:

- **Frontend**: `https://registrop1-frontend.onrender.com`
- **Backend API**: `https://registrop1-backend.onrender.com/api`

## Solución de Problemas

### Verificación Completa del Despliegue

Para diagnosticar cualquier problema con el despliegue en Render, ejecuta el script de verificación completa:

```
npm run verify-render
```

Este script realizará una verificación exhaustiva de todos los componentes del despliegue, incluyendo:

- Verificación de archivos críticos
- Validación de configuración de Render
- Verificación de conexión a la base de datos
- Comprobación de configuración CORS
- Auditoría de seguridad
- Pruebas de rendimiento
- Verificación de conectividad frontend-backend

Sigue las recomendaciones proporcionadas por el script para resolver cualquier problema detectado.

### Problemas de Conexión a la Base de Datos

Si el backend no puede conectarse a la base de datos:

1. Verifica los logs del servicio backend en Render
2. Ejecuta el script de diagnóstico: `npm run check-render-db` desde la consola de Render
3. Asegúrate de que las variables de entorno estén configuradas correctamente

### Verificación de Configuración

Puedes ejecutar el script de verificación de configuración:

```
npm run render-info
```

Este script mostrará información detallada sobre las variables de entorno y la configuración de Render.

### Reinicio Manual

Si necesitas reiniciar los servicios:

1. Ve al dashboard de Render
2. Selecciona el servicio que deseas reiniciar
3. Haz clic en "Manual Deploy" > "Deploy latest commit"

## Consideraciones Importantes

### Plan Gratuito de Render

Ten en cuenta que el plan gratuito de Render tiene las siguientes limitaciones:

- Los servicios web se suspenden después de 15 minutos de inactividad
- Tiempo limitado de CPU y memoria
- La base de datos MySQL gratuita tiene un límite de almacenamiento de 1GB

### Variables de Entorno

Las variables de entorno críticas son:

- `NODE_ENV`: Debe ser `production` en Render
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Configuradas automáticamente por Render

## Mantenimiento

Para actualizar la aplicación, simplemente haz push de tus cambios al repositorio de GitHub. Render detectará los cambios y desplegará automáticamente la nueva versión.

---

## Comandos Útiles

### Verificación Completa del Despliegue
```
npm run verify-render
```
Este comando ejecuta una verificación interactiva completa de todos los aspectos del despliegue en Render, incluyendo configuración, base de datos, CORS, seguridad y rendimiento.

### Verificar Conexión a la Base de Datos
```
npm run check-db
```

### Verificar Configuración de Render
```
npm run check-render
```

### Verificar Base de Datos en Render
```
npm run check-render-db
```

### Verificar Configuración CORS
```
npm run check-cors
```

### Verificar Configuración de Seguridad
```
npm run check-security
```

### Verificar Rendimiento
```
npm run check-performance
```

### Ver Información de Render
```
npm run render-info
```

### Inicializar Base de Datos Manualmente
```
npm run init-db
```