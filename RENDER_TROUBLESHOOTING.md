# Solución de Problemas en Render

Este documento proporciona instrucciones detalladas para solucionar problemas comunes al desplegar la aplicación de Registro de Pasajeros en Render.

## Problemas de Conexión a la Base de Datos

### Error: "No se pudo conectar a la base de datos"

Este error ocurre cuando el backend no puede establecer conexión con la base de datos MySQL. Las causas más comunes son:

1. **Configuración incorrecta de DB_HOST**
   - **Problema**: En Render, no se debe usar `localhost` como host de la base de datos.
   - **Solución**: Verifica que en `render.yaml` la variable `DB_HOST` esté configurada correctamente:
     ```yaml
     - key: DB_HOST
       fromDatabase:
         name: registrop1-db
         property: host
     ```

2. **Servicio de base de datos no iniciado**
   - **Problema**: El servicio de backend intenta conectarse antes de que la base de datos esté lista.
   - **Solución**: Asegúrate de que en `render.yaml` exista la dependencia:
     ```yaml
     dependsOn:
       - registrop1-db
     ```

3. **Credenciales incorrectas**
   - **Problema**: Las credenciales de acceso a la base de datos son incorrectas.
   - **Solución**: Verifica que las variables `DB_USER`, `DB_PASSWORD` y `DB_NAME` estén correctamente configuradas en `render.yaml`.

4. **Problemas de red o firewall**
   - **Problema**: Restricciones de red impiden la conexión.
   - **Solución**: Verifica que en la configuración de la base de datos en `render.yaml` se permitan conexiones:
     ```yaml
     ipAllowList: [] # Permitir conexiones desde cualquier lugar
     ```

## Verificación de la Configuración

Hemos implementado varios scripts para verificar y corregir la configuración:

1. **Corrección del problema de localhost**: Soluciona automáticamente el problema de conexión a localhost en Render
   ```bash
   npm run fix-localhost
   ```

2. **Verificación automática**: Se ejecuta al iniciar el servicio
   ```bash
   npm run fix-render
   ```

3. **Verificación de la base de datos**: Comprueba la conexión a la base de datos
   ```bash
   npm run check-render-db
   ```

4. **Verificación de la configuración general**: Comprueba todas las variables de entorno
   ```bash
   npm run check-render
   ```

## Logs y Diagnóstico

Para diagnosticar problemas, revisa los logs en el panel de control de Render:

1. Ve a tu dashboard en Render
2. Selecciona el servicio `registrop1-backend`
3. Haz clic en la pestaña "Logs"
4. Busca mensajes de error específicos

### Mensajes de Error Comunes

- **Error: No se pudo conectar a la base de datos después de varios intentos**
  - Verifica la configuración de `DB_HOST`, `DB_USER`, `DB_PASSWORD`
  - Asegúrate de que el servicio de base de datos esté en ejecución

- **Error: ER_ACCESS_DENIED_ERROR**
  - Las credenciales de la base de datos son incorrectas
  - Verifica `DB_USER` y `DB_PASSWORD`

- **Error: ER_BAD_DB_ERROR**
  - La base de datos especificada no existe
  - Verifica `DB_NAME` y asegúrate de que la base de datos se haya inicializado correctamente

## Reinicio Manual

Si necesitas reiniciar los servicios manualmente:

1. Ve al dashboard de Render
2. Selecciona el servicio que deseas reiniciar
3. Haz clic en el botón "Manual Deploy" > "Clear build cache & deploy"

## Contacto de Soporte

Si después de seguir estas instrucciones sigues teniendo problemas, contacta al equipo de desarrollo:

- Correo: soporte@registropasajeros.com
- GitHub: Abre un issue en el repositorio del proyecto