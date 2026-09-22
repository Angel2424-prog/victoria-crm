# Victoria CRM

**Plataforma CRM modular con asistente de IA integrado**, construida para equipos comerciales que necesitan trazabilidad completa del ciclo de venta: desde la captación del lead hasta el cierre de la oportunidad.

El vertical de **seguros** es la implementación de referencia — con prima estimada, ramos y clasificación de asegurados — pero el modelo de datos y el pipeline son configurables, de modo que la plataforma se adapta a cualquier organización con un proceso comercial por etapas.

---

## El problema que resuelve

Los equipos comerciales pequeños y medianos suelen operar sobre hojas de cálculo dispersas: se pierde el historial del lead, nadie sabe en qué etapa está cada negociación, y las campañas de marketing no se pueden atribuir a resultados reales.

Victoria CRM centraliza ese flujo en un solo sistema:

- **Captación** → el lead entra por un canal identificable y queda vinculado a la campaña que lo generó.
- **Calificación** → scoring de 0 a 100 y temperatura (Frío / Tibio / Caliente) para priorizar el esfuerzo comercial.
- **Avance** → pipeline visual con etapas configurables, cada una con su probabilidad de cierre asociada.
- **Conversión** → el lead se transforma en cliente conservando todo su historial.
- **Atribución** → las campañas quedan ligadas a los leads captados, con presupuesto y métricas.

---

## Módulos

| Módulo | Qué hace |
|---|---|
| **Dashboard** | KPIs en tiempo real, valor del pipeline, próximas actividades |
| **Leads** | Scoring, temperatura, etapas, canal de origen, historial de cambios |
| **Clientes** | Persona natural o jurídica, clasificación VIP/Premium/Estándar, múltiples contactos, direcciones y documentos |
| **Oportunidades** | Prima estimada, probabilidad de cierre, estados Abierta / Ganada / Perdida |
| **Actividades** | Llamadas, reuniones, emails y tareas vinculadas a leads y clientes |
| **Campañas** | Presupuesto, fechas, métricas y atribución de leads captados |
| **Victoria IA** | Asistente conversacional acotado al dominio comercial |

---

## Victoria: el asistente de IA

Victoria **no es un chatbot de propósito general**. Es un asistente con alcance deliberadamente acotado al dominio comercial, y esa restricción es una decisión de diseño, no una limitación:

- Asiste en la **construcción de campañas de marketing** a partir del contexto real del CRM.
- Ofrece **orientación de ventas** apoyada en el estado del pipeline.
- Guía al usuario dentro del propio sistema.

Un asistente que responde cualquier cosa genera respuestas impredecibles e invita al mal uso. Uno acotado al negocio produce salidas verificables y útiles.

La capa de IA está construida sobre una **integración multi-proveedor** (OpenAI, Google Generative AI y Groq), lo que evita el acoplamiento a un único vendor y permite cambiar de modelo según costo, latencia o disponibilidad.

---

## Arquitectura

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   Frontend (Next.js)    │        │   Backend (Express)      │
│                         │        │                          │
│  App Router · React 19  │  HTTPS │  API REST                │
│  TypeScript · Tailwind  ├───────►│  JWT + bcrypt            │
│  shadcn/ui · NextAuth   │        │  Capa de servicios       │
└─────────────────────────┘        └───────────┬──────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              ▼                                 ▼
                    ┌──────────────────┐            ┌──────────────────────┐
                    │  MongoDB         │            │  Proveedores LLM     │
                    │  (Mongoose ODM)  │            │  OpenAI · Gemini     │
                    └──────────────────┘            │  Groq                │
                                                    └──────────────────────┘

                    Producción: PM2 (proceso) + Nginx (proxy inverso)
```

**Decisiones de diseño** — siguiendo el principio KISS, se priorizó la solución más directa que resuelve el problema real:

- **API REST sobre GraphQL.** El consumo es conocido y estable; GraphQL habría añadido complejidad sin beneficio para un solo cliente frontend.
- **MongoDB sobre relacional.** Las entidades comerciales (contactos, direcciones y documentos anidados por cliente) encajan naturalmente en documentos, evitando joins y tablas puente innecesarias.
- **Capa de servicios separada de los controladores.** Mantiene la lógica de negocio fuera de la capa HTTP y permite probarla de forma aislada.
- **Catálogos como colecciones** (etapas, canales, roles, sucursales) en vez de enums en código: el cliente configura su propio pipeline sin necesidad de un despliegue.

---

## Stack técnico

**Frontend**
| Tecnología | Versión |
|---|---|
| Next.js (App Router) | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| shadcn/ui | — |
| NextAuth.js | 4.x |

**Backend**
| Tecnología | Versión |
|---|---|
| Node.js | 18+ |
| Express | 4.18 |
| MongoDB + Mongoose | 8.x |
| JWT + bcryptjs | 9.x / 2.4 |
| Nodemailer | 7.x |
| OpenAI · Google Generative AI · Groq | SDKs oficiales |

**Infraestructura**
| Componente | Uso |
|---|---|
| PM2 | Gestión de procesos y reinicio automático |
| Nginx | Proxy inverso y terminación TLS |
| Script de despliegue | Publicación reproducible |

---

## Seguridad

- Autenticación con **JWT** y contraseñas cifradas con **bcrypt**.
- **Bloqueo de cuenta por intentos fallidos**, como mitigación de ataques de fuerza bruta.
- Control de acceso por **roles y permisos** configurables.
- Toda la configuración sensible vive en variables de entorno; el repositorio incluye únicamente `env.example`.

---

## Estado del proyecto

Proyecto propio, en desarrollo activo. El código fuente del backend se mantiene en un repositorio privado.

¿Interesado en una demostración o en adaptar la plataforma a tu operación? Escríbeme: **angel2424estrada@gmail.com**

---

## Licencia

© 2026 Angel J. Estrada H. Todos los derechos reservados.

Este repositorio se publica con fines de portafolio y evaluación técnica. Su contenido **no** se licencia para uso, copia, modificación ni redistribución. Consulta [LICENSE](LICENSE).
