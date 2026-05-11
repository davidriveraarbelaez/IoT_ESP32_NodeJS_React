require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

// ==================== CONFIGURACIÓN ====================
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

if (!JWT_SECRET || !API_KEY) {
  console.error('❌ Error: JWT_SECRET y API_KEY son requeridos en .env');
  process.exit(1);
}

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// ==================== MODELOS ====================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const sensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', sensorDataSchema);

// ==================== MIDDLEWARE JWT ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ==================== RUTAS AUTH ====================
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== RUTAS SENSOR ====================
app.post('/api/sensor/data', async (req, res) => {
  try {
    const { deviceId, temperature, humidity, apiKey } = req.body;
    
    if (apiKey !== API_KEY) {
      return res.status(401).json({ error: 'API Key inválida' });
    }
    
    const data = new SensorData({ deviceId, temperature, humidity });
    await data.save();
    
    // Enviar a todos los clientes WebSocket conectados
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
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

app.get('/api/sensor/latest', authenticateToken, async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

app.get('/api/sensor/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const data = await SensorData.find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(data.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

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
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('✅ Cliente WebSocket conectado');
  
  ws.on('message', (message) => {
    console.log('📨 Mensaje recibido:', message.toString());
  });
  
  ws.on('close', () => {
    console.log('🔴 Cliente WebSocket desconectado');
  });
  
  ws.on('error', (error) => {
    console.error('❌ Error WebSocket:', error);
  });
});

// ==================== CONEXIÓN MONGODB ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error MongoDB:', err);
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP + WebSocket corriendo en puerto ${PORT}`);
  console.log(`🔐 API Key configurada: ${API_KEY.substring(0, 8)}...`);
});