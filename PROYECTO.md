# CRM de Seguros - Victoria

## Descripción General

Sistema CRM (Customer Relationship Management) completo para la gestión de seguros, con un asistente de inteligencia artificial llamado **Victoria** integrado con OpenAI.

---

## Stack Tecnológico

### Backend (Node.js + Express)
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Framework web |
| MongoDB | - | Base de datos |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Autenticación |
| bcryptjs | 2.4 | Hash de contraseñas |
| OpenAI | 4.x | IA (Victoria) |

### Frontend (Next.js + React)
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.x | Framework React |
| React | 19.x | UI Library |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos |
| shadcn/ui | - | Componentes UI |
| NextAuth.js | 4.x | Autenticación |
| Lucide React | - | Iconos |

---

## Módulos del Sistema

### 1. Dashboard
- KPIs y estadísticas en tiempo real
- Pipeline de ventas visual
- Próximas actividades
- Valor del pipeline

### 2. Gestión de Leads
- Listado con paginación y búsqueda
- Temperatura: Frío, Tibio, Caliente
- Puntuación (scoring) 0-100
- Etapas del pipeline configurables
- Historial de cambios
- Conversión a cliente

### 3. Gestión de Clientes
- Tipos: Persona Natural (N) / Jurídica (J)
- Clasificación: VIP, Premium, Estándar
- Múltiples contactos y direcciones
- Documentos adjuntos
- Scoring de cliente

### 4. Oportunidades
- Seguimiento de ventas
- Prima estimada
- Probabilidad de cierre
- Estados: Abierta, Ganada, Perdida

### 5. Actividades
- Tipos: Llamada, Reunión, Email, Tarea
- Estados: Pendiente, En Progreso, Completada
- Vinculación a leads/clientes

### 6. Campañas de Marketing
- Gestión de campañas
- Presupuesto y métricas
- Vinculación con leads captados

### 7. Victoria IA (Asistente)
- Chat con GPT-3.5-turbo
- Ayuda en creación de campañas
- Consejos de ventas de seguros
- Guía del sistema

---

## Modelos de Datos (MongoDB)

### Usuario
```javascript
{
  login: String,
  password: String (hashed),
  nombre: String,
  apellido: String,
  email: String,
  telefono: String,
  rol: ObjectId -> Rol,
  sucursal: ObjectId -> Sucursal,
  activo: Boolean,
  bloqueado: Boolean,
  intentos_fallidos: Number
}
```

### Lead
```javascript
{
  codigo: String,
  tipo_persona: 'N' | 'J',
  nombre: String,
  apellido: String,
  documento: String,
  email: String,
  telefono: String,
  celular: String,
  temperatura: 'Frio' | 'Tibio' | 'Caliente',
  puntuacion: Number (0-100),
  etapa: ObjectId -> EtapaPipeline,
  canal: ObjectId -> Canal,
  campana: ObjectId -> Campana,
  ejecutivo: ObjectId -> Usuario,
  convertido: Boolean,
  cliente: ObjectId -> Cliente,
  historial: Array
}
```

### Cliente
```javascript
{
  codigo: String,
  tipo_persona: 'N' | 'J',
  tipo_documento: 'V' | 'E' | 'J' | 'P' | 'G' | 'R',
  documento: String,
  nombre: String,
  apellido: String,
  clasificacion: 'VIP' | 'Premium' | 'Estandar',
  scoring: Number,
  contactos: Array,
  direcciones: Array,
  documentos: Array
}
```

### Oportunidad
```javascript
{
  codigo: String,
  lead: ObjectId -> Lead,
  cliente: ObjectId -> Cliente,
  producto: String,
  prima_estimada: Number,
  probabilidad: Number,
  estado: 'Abierta' | 'Ganada' | 'Perdida',
  ejecutivo: ObjectId -> Usuario
}
```

### Actividad
```javascript
{
  tipo: 'Llamada' | 'Reunion' | 'Email' | 'Tarea',
  asunto: String,
  descripcion: String,
  fecha_programada: Date,
  estado: 'Pendiente' | 'EnProgreso' | 'Completada',
  lead: ObjectId -> Lead,
  cliente: ObjectId -> Cliente,
  usuario: ObjectId -> Usuario
}
```

### Catálogos
- **Rol**: nombre, permisos[]
- **Sucursal**: codigo, nombre, direccion
- **Canal**: nombre (origen de leads)
- **EtapaPipeline**: nombre, orden, color, probabilidad
- **Campana**: nombre, tipo, presupuesto, fechas

---

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Usuario actual |

### Leads
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/leads | Listar (paginado) |
| GET | /api/leads/:id | Obtener por ID |
| POST | /api/leads | Crear |
| PUT | /api/leads/:id | Actualizar |
| DELETE | /api/leads/:id | Eliminar |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/clientes | Listar (paginado) |
| GET | /api/clientes/:id | Obtener por ID |
| POST | /api/clientes | Crear |
| PUT | /api/clientes/:id | Actualizar |
| DELETE | /api/clientes/:id | Desactivar |

### Oportunidades
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/oportunidades | Listar |
| POST | /api/oportunidades | Crear |
| PUT | /api/oportunidades/:id | Actualizar |

### Actividades
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/actividades | Listar |
| POST | /api/actividades | Crear |
| PUT | /api/actividades/:id | Actualizar |

### Campañas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/campanas | Listar |
| POST | /api/campanas | Crear |
| PUT | /api/campanas/:id | Actualizar |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | Estadísticas |

### Victoria IA
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/assistant | Chat con IA |

### Catálogos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/roles | Listar roles |
| GET | /api/canales | Listar canales |
| GET | /api/etapas | Listar etapas |
| GET | /api/sucursales | Listar sucursales |

---

## Estructura de Carpetas (Nueva)

```
CRM/
├── backend/                 # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/          # Configuración (db, etc)
│   │   ├── controllers/     # Controladores
│   │   ├── middleware/      # Auth, validación
│   │   ├── models/          # Modelos Mongoose
│   │   ├── routes/          # Rutas Express
│   │   ├── services/        # Lógica de negocio
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/                # UI (Next.js + React)
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # Componentes React
│   │   ├── lib/             # Utilidades
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── .env.local
│
└── PROYECTO.md              # Esta documentación
```

---

## Configuración

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu-secret-key
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key
```

---

## Comandos

### Backend
```bash
cd backend
npm install
cp .env.example .env     # Configurar variables de entorno
npm run seed             # Crear datos de prueba (opcional)
npm run dev              # Desarrollo (nodemon)
npm start                # Producción
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Desarrollo
npm run build    # Build producción
npm start        # Iniciar build
```

---

## Puertos
| Servicio | Puerto |
|----------|--------|
| Backend API | 5000 |
| Frontend | 3000 |
| MongoDB | 27017 |

---

## Credenciales de Prueba
- **Usuario:** admin
- **Contraseña:** Admin123!

---

## Características Destacadas

1. **Dashboard interactivo** con KPIs en tiempo real
2. **Pipeline de ventas** visual con etapas configurables
3. **Sistema de scoring** para leads (0-100) y temperatura
4. **Clasificación de clientes** (VIP, Premium, Estándar)
5. **Historial de cambios** en leads
6. **Asistente IA** (Victoria) integrado con OpenAI
7. **UI moderna** con shadcn/ui y Tailwind
8. **Responsive** con sidebar móvil
9. **Paginación** en listados
10. **Búsqueda y filtros** avanzados
11. **Autenticación JWT** con bloqueo por intentos fallidos
