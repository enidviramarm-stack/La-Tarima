Sistema de Reservas y Gestión de Bar – La Tarima

1. Descripción general del proyecto

    Este proyecto corresponde al desarrollo de una API REST para la gestión de un Sistema de Reservas en un Bar con presentaciones musicales en vivo, llamado La Tarima.

    La aplicación permite administrar:

    Mesas
    Productos
    Clientes
    Personal (Staff)
    Reservas
    Pedidos
    Pagos
    Reportes de auditoría

    El sistema fue desarrollado utilizando Node.js, Express y MongoDB, siguiendo una arquitectura MVC, con validaciones robustas y reglas de negocio implementadas a nivel de backend.

2. Tecnologías utilizadas

    Node.js
    Express.js
    MongoDB
    Mongoose
    Express-validator
    Thunder Client (para pruebas)
    Nodemon (entorno de desarrollo)

3. Arquitectura del proyecto

    El proyecto sigue el patrón MVC (Model – View – Controller), organizado de la siguiente manera:

    controllers/   -> Lógica de negocio y CRUD
    models/        -> Esquemas de MongoDB
    routes/        -> Endpoints de la API
    middlewares/   -> Validaciones y sanitización

    app.js         -> Configuración de Express y rutas
    index.js       -> Conexión a MongoDB e inicio del servidor

4. Instalación y ejecución

    4.1 Requisitos

        Node.js v18 o superior
        MongoDB en ejecución

    4.2 Instalación de dependencias

        En la raíz del proyecto ejecutar:

        npm install

    4.3 Ejecución del proyecto

        Modo desarrollo:
        npm run dev

        Modo producción:
        npm start

        El servidor se ejecuta por defecto en:
        http://localhost:3000

5. Base de datos

    Motor: MongoDB
    Nombre de la base de datos: La_Tarima

    La conexión se realiza desde el archivo index.js.

6. Endpoints principales

    Mesas

    POST    /api/tables
    GET     /api/tables
    GET     /api/tables/:table_id
    PUT     /api/tables/:table_id
    DELETE  /api/tables/:table_id

    Productos

    POST    /api/products
    GET     /api/products
    GET     /api/products/:Product_id
    PUT     /api/products/:Product_id
    DELETE  /api/products/:Product_id

    Clientes

    POST    /api/clients
    GET     /api/clients
    GET     /api/clients/:docID
    PUT     /api/clients/:docID
    DELETE  /api/clients/:docID

    Staff

    POST    /api/staff
    GET     /api/staff
    GET     /api/staff/:user_id
    PUT     /api/staff/:user_id
    DELETE  /api/staff/:user_id

    Reservas

    POST    /api/reservations
    GET     /api/reservations
    GET     /api/reservations/:reservation_id
    PUT     /api/reservations/:reservation_id
    DELETE  /api/reservations/:reservation_id   (cancela la reserva)

    Pedidos

    POST    /api/orders
    GET     /api/orders
    GET     /api/orders/:order_id
    PATCH   /api/orders/:order_id/status
    DELETE  /api/orders/:order_id

    Pagos

    POST    /api/payments
    GET     /api/payments
    GET     /api/payments/:payment_id
    PATCH   /api/payments/:payment_id/status
    DELETE  /api/payments/:payment_id

    Reportes (Auditoría)

    GET /api/reports/sales-by-category
    GET /api/reports/top-clients
    GET /api/reports/payments-by-date?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    GET /api/reports/sales-by-product

7. Reglas de negocio implementadas

    No se permite registrar mesas duplicadas.
    No se permite registrar productos con categorías inválidas.
    No se permite registrar clientes con documentos duplicados.
    Una reserva:

    Debe estar asociada a una mesa existente.
    No puede exceder la capacidad de la mesa.
    No puede solaparse con otra reserva en el mismo horario.


    Un pedido:

    Debe tener al menos un producto.
    Solo puede cambiar de estado a valores válidos.


    Un pago:

    Debe tener método válido.
    El monto no puede ser negativo.


    Los reportes solo consideran información válida y pagos aprobados.

8. Pruebas del sistema

    Las pruebas se realizaron usando Thunder Client, validando todos los escenarios del negocio:

    Registro de mesas
    Alta de productos
    Registro de clientes
    Creación de reservas
    Evitar doble reserva
    Apertura de pedidos
    Cambio de estado de pedidos
    Registro de pagos
    Reporte de ventas por categoría
    Top clientes por consumo

    Todos los escenarios fueron probados exitosamente.

9. Manejo de validaciones y errores

    Validaciones de formato y datos usando express-validator
    Validaciones de negocio en los controllers
    Manejo de errores con códigos HTTP:

    Codigo    | Significado
    201       | Creación exitosa
    400       | Datos inválidos
    404       | Recurso no encontrado
    409       | conflictos (Duplicados o solapamientos)
    422       | Error de validación
    500       | Error interno del servidor

10. Estado del proyecto

    Backend completo
    Arquitectura MVC correcta
    Validaciones robustas
    Reglas de negocio implementadas
    Listo para evaluación académica

11. Autores

    Juan Felipe García Vega
    Enid Norena Viramar
    Proyecto académico – Bases de Datos Avanzadas