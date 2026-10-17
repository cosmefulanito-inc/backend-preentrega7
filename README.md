# Sistema Backend de Turnos y Reservas
 
API REST construida con Node.js y Express para gestionar servicios y reservas. Los datos se almacenan en una base de datos MongoDB (MongoDB Atlas), a través de Mongoose.

Además de la API, el proyecto incluye vistas renderizadas en el servidor con Handlebars y actualización en tiempo real con Socket.io: cuando se crea un servicio, el listado abierto en el navegador se actualiza sin recargar la página.

## Tecnologías

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Handlebars (express-handlebars)
- Socket.io
- dotenv

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/cosmefulanito-inc/backend-preentrega7.git
```

2. Entrar a la carpeta del proyecto:

```bash
cd backend-preentrega7
```

3. Instalar las dependencias:

```bash
npm install
```

4. Crear un archivo `.env` en la raíz del proyecto, tomando como modelo `.env.example`:

```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<base-de-datos>
```

> Para conectarse a MongoDB Atlas, la IP desde la que se ejecuta el proyecto tiene que estar habilitada en **Network Access** dentro del panel de Atlas. Si la conexión falla, el servidor no llega a iniciarse.

## Ejecución

```bash
npm start
```

El servidor queda disponible en `http://localhost:8080`. La API responde en las rutas `/api/...` y las vistas en las rutas `/views/...`.

## Arquitectura por capas

El proyecto está organizado en capas. Cada una tiene una única responsabilidad y solo se comunica con la capa inmediatamente inferior:

```
Petición HTTP
     ↓
  Router        → define el endpoint
     ↓
  Controller    → lee la request y arma la response (JSON o vista)
     ↓
  Service       → aplica las reglas del negocio
     ↓
  Repository    → intermediario entre el negocio y el acceso a datos
     ↓
  DAO           → lee y escribe en MongoDB mediante los modelos de Mongoose
     ↓
  MongoDB Atlas
```

- **routes/**: definen los endpoints y los conectan con su controller. No contienen lógica.
- **controllers/**: leen `req.params`, `req.query` y `req.body`, llaman al service correspondiente y arman la respuesta. Los controllers de la API responden con `res.status().json()`; el controller de vistas responde con `res.render()`. Son la única capa que conoce Express.
- **services/**: contienen las reglas del negocio. Por ejemplo, que toda reserva nueva se crea con estado `pending` y sin servicios, que el `_id` de un registro no se puede modificar, o que agregar a una reserva un servicio que ya tiene incrementa su cantidad.
- **repositories/**: exponen al service las operaciones de datos (`getAll`, `getById`, `create`, `update`, `remove`) y las delegan en el DAO.
- **dao/**: acceden directamente a la base de datos. Guardan los datos tal como los reciben, sin tomar decisiones. Las consultas usan `.lean()` para devolver objetos planos de JavaScript, que es el formato que Handlebars puede mostrar.
- **models/**: definen los esquemas de Mongoose (campos, tipos y validaciones) de servicios y reservas.
- **views/**: plantillas de Handlebars. Reciben los datos desde el controller de vistas y no contienen información escrita a mano.
- **public/**: archivos estáticos que Express envía al navegador sin procesar (hojas de estilo y el script del cliente de Socket.io).

Las vistas reutilizan la misma arquitectura que la API: el controller de vistas llama a los mismos services, de modo que la información que se muestra en el navegador pasa por todas las capas, igual que la que devuelve la API.

## Vistas con Handlebars

Express usa Handlebars como motor de vistas. Todas las vistas comparten el layout `views/layouts/main.handlebars`, que incluye la hoja de estilos, el menú de navegación y los scripts de Socket.io.

| Ruta | Vista | Contenido |
|---|---|---|
| `/views/services` | `services.handlebars` | Listado de servicios con nombre, descripción, duración, precio, categoría y disponibilidad |
| `/views/bookings` | `bookings.handlebars` | Listado de reservas con cliente, email, fecha, hora, estado y servicios incluidos con su cantidad |

Los datos de ambas vistas se obtienen de MongoDB en cada petición.

## Tiempo real con Socket.io

Socket.io se configura en `server.js`. Para que Express y Socket.io compartan el mismo puerto, se crea un servidor HTTP a partir de la aplicación de Express y Socket.io se monta sobre ese servidor. La instancia de Socket.io se guarda con `app.set("io", io)` para que los controllers puedan acceder a ella.

### Evento implementado

| Evento | Se emite cuando | Efecto en el navegador |
|---|---|---|
| `service:created` | Se crea un servicio con `POST /api/services` | La vista `/views/services` agrega el nuevo servicio a la tabla sin recargar la página |

El flujo es el siguiente:

1. Un cliente crea un servicio con `POST /api/services`.
2. El controller guarda el servicio a través de las capas y, una vez creado, emite el evento `service:created` con los datos del nuevo servicio a todos los navegadores conectados.
3. El script `public/js/socket.js`, que se ejecuta en el navegador, escucha ese evento y agrega una fila a la tabla.

### Cómo probarlo

1. Iniciar el servidor con `npm start`.
2. Abrir `http://localhost:8080/views/services` en el navegador.
3. Desde Postman (u otro cliente HTTP), enviar un `POST /api/services` con un servicio nuevo.
4. El servicio aparece en la tabla del navegador sin recargar la página.

## Migración de archivos JSON a MongoDB

En una entrega anterior, los datos se guardaban en archivos JSON y luego se reemplazó ese almacenamiento por MongoDB. Gracias a la arquitectura por capas, el cambio se concentró en el acceso a datos:

- Se crearon nuevos DAOs en `dao/mongo/`, con las mismas funciones que los DAOs de archivos. El repository pasó a usar estos DAOs, y los controllers y routes no se modificaron.
- Se agregaron los modelos de Mongoose en `models/`, que validan los datos antes de guardarlos.
- Los identificadores ya no se generan en la capa de servicio: MongoDB asigna automáticamente un `_id` (ObjectId) a cada documento.
- Cada reserva guarda los servicios que incluye como referencias a sus `_id`, junto con la cantidad reservada de cada uno.
- Los DAOs de archivos se conservan en `dao/fileSystem/` como referencia de la implementación anterior.

## Estructura del proyecto

```
src/
  config/
    env.config.js
    database.config.js
  routes/
    services.router.js
    bookings.router.js
    views.router.js
  controllers/
    services.controller.js
    bookings.controller.js
    views.controller.js
  services/
    services.service.js
    bookings.service.js
  repositories/
    services.repository.js
    bookings.repository.js
  dao/
    mongo/
      services.mongo.dao.js
      bookings.mongo.dao.js
    fileSystem/
      services.fs.dao.js
      bookings.fs.dao.js
  models/
    service.model.js
    bookings.model.js
  views/
    layouts/
      main.handlebars
    services.handlebars
    bookings.handlebars
  public/
    css/
      styles.css
    js/
      socket.js
  app.js
  server.js
```

## Endpoints

Los ids de las rutas (`:sid` y `:bid`) corresponden al `_id` que MongoDB asigna a cada documento. Si el id no tiene un formato válido o no existe, la API responde que el registro no fue encontrado.

### Services

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/services` | Lista todos los servicios. Admite filtros por query: `category` y `available` |
| GET | `/api/services/:sid` | Obtiene un servicio por su id |
| POST | `/api/services` | Crea un nuevo servicio y emite el evento `service:created` |
| PUT | `/api/services/:sid` | Actualiza un servicio existente |
| DELETE | `/api/services/:sid` | Elimina un servicio |

Ejemplo de filtro: `GET /api/services?category=salud&available=true`

Campos obligatorios para crear un servicio:

```json
{
  "name": "Consulta general",
  "duration": 30,
  "price": 5000,
  "category": "salud",
  "available": true
}
```

### Bookings

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/bookings` | Lista todas las reservas |
| POST | `/api/bookings` | Crea una nueva reserva |
| GET | `/api/bookings/:bid` | Obtiene una reserva por su id |
| POST | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva existente. Valida que el servicio exista |
| DELETE | `/api/bookings/:bid` | Elimina una reserva |

Ejemplo de body para crear una reserva:

```json
{
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-10-15",
  "time": "10:30"
}
```

Toda reserva nueva se crea con estado `pending` y sin servicios. Si el mismo servicio se agrega más de una vez a una reserva, se incrementa su cantidad (`quantity`).

### Vistas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/views/services` | Renderiza el listado de servicios. Se actualiza en tiempo real al crear un servicio |
| GET | `/views/bookings` | Renderiza el listado de reservas |