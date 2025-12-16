
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

app.use(cors());
app.use(express.json());

// --- Cached MongoDB Connection for Serverless ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).json({ message: "Database Connection Failed" });
  }
});

// --- Helper ---
const createLog = async (type, message, details = null) => {
    try {
        await Log.create({ type, message, details });
    } catch (e) {
        console.error("Log error:", e);
    }
};

// --- ROUTES ---

app.get('/api/health', (req, res) => res.send('Vercel Backend OK'));

// 1. Auth: Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            await createLog('WARNING', `Başarısız admin giriş: ${username}`);
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        if (user.role !== 'Admin') return res.status(403).json({ message: 'Yetkisiz erişim' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
        await createLog('INFO', `Admin girişi: ${username}`);
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Auth: Telegram Login
app.post('/api/auth/telegram', async (req, res) => {
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

        // Master Admin Check (ID: 8426134237)
        if (tgUser.id === 8426134237 && user.role !== 'Admin') {
             user.role = 'Admin';
             await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Telegram login hatası' });
    }
});

// 3. Bots API
app.get('/api/bots', async (req, res) => {
    const bots = await Bot.find().sort({ createdAt: -1 });
    res.json(bots);
});

app.get('/api/bots/:id', async (req, res) => {
    const bot = await Bot.findById(req.params.id);
    if (!bot) return res.status(404).json({ message: 'Bot bulunamadı' });
    res.json(bot);
});

app.post('/api/bots', async (req, res) => {
    try {
        const newBot = await Bot.create(req.body);
        await createLog('USER_ACTION', `Yeni bot eklendi: ${newBot.name}`);
        res.status(201).json(newBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/bots/:id', async (req, res) => {
    try {
        const updatedBot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await createLog('USER_ACTION', `Bot güncellendi: ${updatedBot.name}`);
        res.json(updatedBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/bots/:id', async (req, res) => {
    await Bot.findByIdAndDelete(req.params.id);
    await createLog('USER_ACTION', `Bot silindi ID: ${req.params.id}`);
    res.json({ message: 'Bot silindi' });
});

// 4. Users API
app.get('/api/users', async (req, res) => {
    const users = await User.find().sort({ joinDate: -1 });
    res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

app.put('/api/users/:id', async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
});

app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kullanıcı silindi' });
});

// 5. Logs & Stats
app.get('/api/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

app.get('/api/stats/dashboard', async (req, res) => {
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
});

// Vercel Serverless Entry Point
module.exports = app;
