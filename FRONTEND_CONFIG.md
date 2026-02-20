# Configuración del Frontend para conectar con el Backend

## URL del Backend en Producción

```
http://23.94.93.96/api
```

## Variables de Entorno para el Frontend

Crear un archivo `.env` o `.env.production` con:

```env
REACT_APP_API_URL=http://23.94.93.96/api
# o si usas Vite:
VITE_API_URL=http://23.94.93.96/api
# o si usas Next.js:
NEXT_PUBLIC_API_URL=http://23.94.93.96/api
```

## Endpoints Disponibles

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/me` | Obtener usuario actual |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar usuarios |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |

### Leads
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/leads` | Listar leads |
| POST | `/api/leads` | Crear lead |
| PUT | `/api/leads/:id` | Actualizar lead |
| DELETE | `/api/leads/:id` | Eliminar lead |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |

### Oportunidades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/oportunidades` | Listar oportunidades |
| POST | `/api/oportunidades` | Crear oportunidad |
| PUT | `/api/oportunidades/:id` | Actualizar oportunidad |
| DELETE | `/api/oportunidades/:id` | Eliminar oportunidad |

### Actividades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/actividades` | Listar actividades |
| POST | `/api/actividades` | Crear actividad |
| PUT | `/api/actividades/:id` | Actualizar actividad |
| DELETE | `/api/actividades/:id` | Eliminar actividad |

### Campañas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/campanas` | Listar campañas |
| POST | `/api/campanas` | Crear campaña |
| PUT | `/api/campanas/:id` | Actualizar campaña |
| DELETE | `/api/campanas/:id` | Eliminar campaña |

### Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard` | Obtener datos del dashboard |

### Asistente IA
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/assistant` | Enviar mensaje al asistente |

### Notificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notificaciones` | Listar notificaciones |

### Catálogos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/roles` | Listar roles |
| GET | `/api/canales` | Listar canales |
| GET | `/api/etapas` | Listar etapas |
| GET | `/api/sucursales` | Listar sucursales |

### Health Check
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificar estado del servidor |

## Autenticación

El backend usa **JWT (JSON Web Tokens)**. Después del login, incluir el token en todas las peticiones:

```javascript
// Ejemplo con fetch
fetch('http://23.94.93.96/api/leads', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Ejemplo con axios
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## CORS

El backend está configurado para aceptar peticiones desde el frontend. Si el frontend está en un dominio diferente, asegúrate de que la variable `FRONTEND_URL` en el backend apunte a tu dominio.

## Verificar Conexión

Para verificar que el backend está funcionando:

```bash
curl http://23.94.93.96/api/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"2026-02-20T20:00:54.533Z"}
```

## Contacto

Si hay problemas de conexión, verificar:
1. Que el backend esté corriendo (`pm2 status` en el servidor)
2. Que el firewall permita el tráfico (puertos 80/443)
3. Que la URL del API sea correcta en las variables de entorno del frontend
