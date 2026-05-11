require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// ==================== MODELOS MONGODB ====================

// Modelo de Usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Modelo de Datos del Sensor
const sensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', sensorDataSchema);

// ==================== MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== RUTAS DE DATOS (PROTEGIDAS) ====================

// Recibir datos desde ESP32 (API Key simple o header)
app.post('/api/sensor/data', async (req, res) => {
  try {
    const { deviceId, temperature, humidity, apiKey } = req.body;
    
    // Validación simple de API Key
    if (apiKey !== 'TU_API_KEY_SECRETA') {
      return res.status(401).json({ error: 'API Key inválida' });
    }
    
    const data = new SensorData({
      deviceId,
      temperature,
      humidity
    });
    
    await data.save();
    
    // Enviar a todos los clientes WebSocket conectados
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'new_data',
          data: { deviceId, temperature, humidity, timestamp: new Date() }
        }));
      }
    });
    
    res.status(201).json({ message: 'Datos guardados', id: data._id });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Obtener últimos datos (Dashboard)
app.get('/api/sensor/latest', authenticateToken, async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Obtener historial de datos
app.get('/api/sensor/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const data = await SensorData.find({
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));
    
    res.json(data.reverse()); // Orden cronológico para gráficas
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Estadísticas
app.get('/api/sensor/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await SensorData.aggregate([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          maxTemp: { $max: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxHumidity: { $max: '$humidity' },
          minHumidity: { $min: '$humidity' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
});

// ==================== WEBSOCKET ====================

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
});

// ==================== CONEXIÓN MONGODB ====================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error MongoDB:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});