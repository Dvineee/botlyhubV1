
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import Models (Vercel pathing)
const User = require('./models/User');
const Bot = require('./models/Bot');
const Log = require('./models/Log');

const app = express();
const router = express.Router(); // Use a router for better path handling

app.use(cors());
app.use(express.json());

// --- Cached MongoDB Connection for Serverless ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  // MongoDB URI kontrolü
  if (!process.env.MONGODB_URI) {
     console.warn("MONGODB_URI is not defined. Skipping DB connection.");
     return null;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log("DB Connected");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("DB Connection Error:", e);
    // Don't throw, let it fail gracefully in routes
  }
  return cached.conn;
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// --- Helper ---
const createLog = async (type, message, details = null) => {
    try {
        if (mongoose.connection.readyState === 1) {
            await Log.create({ type, message, details });
        }
    } catch (e) {
        console.error("Log error:", e);
    }
};

// --- ROUTES (Mounted on router) ---

router.get('/health', (req, res) => res.send('Vercel Backend OK'));

// 1. Auth: Admin Login
router.post('/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            await createLog('WARNING', `Başarısız admin giriş: ${username}`);
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        if (user.role !== 'Admin') return res.status(403).json({ message: 'Yetkisiz erişim' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
        await createLog('INFO', `Admin girişi: ${username}`);
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// 2. Auth: Telegram Login
router.post('/auth/telegram', async (req, res) => {
    const { initData } = req.body;
    try {
        const urlParams = new URLSearchParams(initData);
        const userDataStr = urlParams.get('user');
        if (!userDataStr) return res.status(400).json({ message: 'Geçersiz Telegram verisi' });

        const tgUser = JSON.parse(userDataStr);
        let user = await User.findOne({ telegramId: tgUser.id });
        
        if (!user) {
            user = await User.create({
                name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
                username: tgUser.username || `user_${tgUser.id}`,
                telegramId: tgUser.id,
                avatar: tgUser.photo_url || null,
                role: 'User'
            });
            await createLog('USER_ACTION', `Yeni kullanıcı (Telegram): ${user.username}`);
        } else {
            user.username = tgUser.username || user.username;
            user.name = `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
            await user.save();
        }

        // Master Admin Check
        if (tgUser.id === 8426134237 && user.role !== 'Admin') {
             user.role = 'Admin';
             await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Telegram login hatası' });
    }
});

// 3. Bots API
router.get('/bots', async (req, res) => {
    try {
        const bots = await Bot.find().sort({ createdAt: -1 });
        res.json(bots);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.get('/bots/:id', async (req, res) => {
    try {
        const bot = await Bot.findById(req.params.id);
        if (!bot) return res.status(404).json({ message: 'Bot bulunamadı' });
        res.json(bot);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.post('/bots', async (req, res) => {
    try {
        const newBot = await Bot.create(req.body);
        await createLog('USER_ACTION', `Yeni bot eklendi: ${newBot.name}`);
        res.status(201).json(newBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/bots/:id', async (req, res) => {
    try {
        const updatedBot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await createLog('USER_ACTION', `Bot güncellendi: ${updatedBot.name}`);
        res.json(updatedBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/bots/:id', async (req, res) => {
    try {
        await Bot.findByIdAndDelete(req.params.id);
        await createLog('USER_ACTION', `Bot silindi ID: ${req.params.id}`);
        res.json({ message: 'Bot silindi' });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// 4. Users API
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ joinDate: -1 });
        res.json(users);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Kullanıcı silindi' });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// 5. Logs & Stats
router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.get('/stats/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeBots = await Bot.countDocuments({ status: 'active' });
        const logsCount = await Log.countDocuments();
        const bots = await Bot.find();
        const potentialRevenue = bots.reduce((acc, b) => acc + (b.price || 0), 0) * 12; 

        res.json({
            totalUsers,
            totalRevenue: potentialRevenue,
            totalViews: logsCount * 5,
            activeBots
        });
    } catch(e) { 
        console.error("Stats Error:", e);
        res.status(500).json({error: e.message}); 
    }
});

// Mount router at /api
app.use('/api', router);

// Vercel Serverless Entry Point
module.exports = app;
