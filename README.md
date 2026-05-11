# IoT_ESP32_NodeJS_React

## Estructura general del proyecto

```
/
iot-project/
├── iot-backend/                 # API REST + WebSocket (Node.js)
│   ├── .env                     # Variables de entorno (NO subir a git)
│   ├── .env.example             # Plantilla de variables para el equipo
│   ├── .gitignore               # Ignorar node_modules y .env
│   ├── package.json             # Dependencias y scripts
│   ├── package-lock.json        # Lock de versiones
│   ├── server.js                # Punto de entrada del servidor
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # Configuración de MongoDB
│   │   │
│   │   ├── models/
│   │   │   ├── User.js         # Modelo de usuarios (Mongoose)
│   │   │   └── SensorData.js   # Modelo de datos del sensor
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js          # Rutas: login, register
│   │   │   └── sensor.js        # Rutas: recibir/enviar datos
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js          # Middleware JWT
│   │   │
│   │   └── utils/
│   │       └── websocket.js     # Lógica de WebSocket
│   │
│   └── node_modules/            # Dependencias instaladas (ignorado en git)
│
├── iot-dashboard/               # Frontend React
│   ├── .env                     # Variables de entorno frontend
│   ├── .env.production          # Variables para producción
│   ├── .gitignore               # Ignora node_modules y build
│   ├── package.json             # Dependencias React
│   ├── package-lock.json
│   ├── README.md                # Documentación del frontend
│   │
│   ├── public/
│   │   ├── index.html           # HTML principal
│   │   ├── manifest.json        # Config PWA
│   │   ├── favicon.ico
│   │   └── logo192.png
│   │
│   ├── src/
│   │   ├── index.js             # Punto de entrada React
│   │   ├── index.css            # Estilos globales
│   │   ├── App.js               # Router principal
│   │   ├── App.css
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js   # Estado global de autenticación
│   │   │
│   │   ├── components/
│   │   │   ├── Login.js         # Pantalla de login/register
│   │   │   ├── Dashboard.js     # Panel principal
│   │   │   ├── SensorChart.js   # Gráfica Recharts
│   │   │   ├── StatsCards.js    # Tarjetas de estadísticas
│   │   │   ├── Navbar.js        # Barra de navegación
│   │   │   ├── DataTable.js     # Tabla de lecturas
│   │   │   └── AlertPanel.js    # Panel de alertas/umbrales
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js  # Hook personalizado WS
│   │   │   └── useSensorData.js # Hook para fetch de datos
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # Configuración de Axios
│   │   │
│   │   └── utils/
│   │       ├── formatDate.js    # Formateadores de fecha
│   │       └── constants.js     # Constantes (URLs, etc.)
│   │
│   └── node_modules/            # Dependencias (ignorado en git)
│
├── iot-arduino/.                # Código para ESP32
│   ├── esp32_dht11.ino          # Sketch principal Arduino
│   ├── config.h                 # Configuraciones (WiFi, API)
│   ├── wifi_manager.h           # Gestión de conexión WiFi
│   ├── sensor_manager.h         # Lectura del DHT11
│   ├── api_client.h             # Cliente HTTP para API
│   │
│   └── libraries/               # Librerías personalizadas (opcional)
│       └── README.md
│
├── docs/                        # Documentación
│   ├── api-endpoints.md         # Documentación de la API
│   ├── database-schema.md       # Esquema de MongoDB
│   ├── deployment-guide.md      # Guía de despliegue
│   └── diagrams/
│       ├── architecture.png
│       └── wiring-diagram.png
│
├── scripts/                     # Scripts de utilidad
│   ├── setup.sh                 # Script de instalación inicial
│   ├── deploy-backend.sh        # Deploy automático backend
│   └── seed-database.js         # Datos de prueba para MongoDB
│
├── docker-compose.yml           # Orquestación Docker (opcional)
├── .gitignore                   # Global del proyecto
├── README.md                    # Documentación principal
└── LICENSE                      # Licencia del proyecto
```