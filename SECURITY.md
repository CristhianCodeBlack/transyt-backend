# Configuración de Seguridad

## Variables de Entorno Requeridas

Para ejecutar la aplicación de forma segura, configura las siguientes variables de entorno:

### Base de Datos
```bash
DB_USERNAME=tu_usuario_db
DB_PASSWORD=tu_password_db
```

### JWT
```bash
JWT_SECRET=tu_clave_secreta_jwt_muy_larga_y_segura
```

### Microsoft Graph
```bash
GRAPH_TENANT_ID=tu_tenant_id
GRAPH_CLIENT_ID=tu_client_id
GRAPH_CLIENT_SECRET=tu_client_secret
```

## Configuración en Desarrollo

1. Copia `.env.example` a `.env`
2. Completa los valores reales
3. Nunca subas el archivo `.env` al repositorio

## Configuración en Producción

Configura las variables de entorno directamente en tu servidor o plataforma de despliegue.

## Notas de Seguridad

- Usa contraseñas fuertes para la base de datos
- El JWT_SECRET debe ser una cadena aleatoria de al menos 256 bits
- Mantén las credenciales de Microsoft Graph seguras
- Revisa regularmente los logs de seguridad