
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Bot = require('./models/Bot');
const Log = require('./models/Log');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Bağlantısı Başarılı'))
  .catch(err => console.error('❌ MongoDB Bağlantı Hatası:', err));

// --- Helpers ---
const createLog = async (type, message, details = null) => {
    try {
        await Log.create({ type, message, details });
    } catch (e) {
        console.error("Loglama hatası:", e);
    }
};

// --- ROUTES ---

// 1. Auth: Admin Login (Username/Password)
app.post('/api/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Not: Gerçek uygulamada password hashlenmeli (bcrypt). Şimdilik plain-text.
        const user = await User.findOne({ username, password });
        
        if (!user) {
            await createLog('WARNING', `Başarısız admin giriş denemesi: ${username}`);
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        if (user.role !== 'Admin') {
            return res.status(403).json({ message: 'Yetkisiz erişim' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
        
        await createLog('INFO', `Admin girişi yapıldı: ${username}`);
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Auth: Telegram Login
app.post('/api/auth/telegram', async (req, res) => {
    const { initData } = req.body;
    
    // Burada Telegram Hash doğrulaması yapılmalı (HMAC-SHA256)
    // Şimdilik demo modunda direkt kabul ediyoruz ve kullanıcıyı buluyoruz/oluşturuyoruz.
    
    try {
        const urlParams = new URLSearchParams(initData);
        const userDataStr = urlParams.get('user');
        
        if (!userDataStr) {
            return res.status(400).json({ message: 'Geçersiz Telegram verisi' });
        }

        const tgUser = JSON.parse(userDataStr);

        let user = await User.findOne({ telegramId: tgUser.id });
        
        if (!user) {
            // Yeni kullanıcı oluştur
            user = await User.create({
                name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
                username: tgUser.username || `user_${tgUser.id}`,
                telegramId: tgUser.id,
                avatar: tgUser.photo_url || null,
                role: 'User'
            });
            await createLog('USER_ACTION', `Yeni kullanıcı kayıt oldu (Telegram): ${user.username}`);
        } else {
            // Bilgileri güncelle
            user.username = tgUser.username || user.username;
            user.name = `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
            await user.save();
        }

        // Özel Admin ID kontrolü (8426134237)
        if (tgUser.id === 8426134237 && user.role !== 'Admin') {
             user.role = 'Admin';
             await user.save();
             console.log("Master Admin yetkisi verildi:", tgUser.id);
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Telegram login hatası' });
    }
});

// 3. Bots: Get All
app.get('/api/bots', async (req, res) => {
    try {
        const bots = await Bot.find().sort({ createdAt: -1 });
        res.json(bots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Bots: Get One
app.get('/api/bots/:id', async (req, res) => {
    try {
        const bot = await Bot.findById(req.params.id);
        if (!bot) return res.status(404).json({ message: 'Bot bulunamadı' });
        res.json(bot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Bots: Create (Admin Only - Middleware eklenebilir)
app.post('/api/bots', async (req, res) => {
    try {
        const newBot = await Bot.create(req.body);
        await createLog('USER_ACTION', `Yeni bot eklendi: ${newBot.name}`);
        res.status(201).json(newBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 6. Bots: Update
app.put('/api/bots/:id', async (req, res) => {
    try {
        const updatedBot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await createLog('USER_ACTION', `Bot güncellendi: ${updatedBot.name}`);
        res.json(updatedBot);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 7. Bots: Delete
app.delete('/api/bots/:id', async (req, res) => {
    try {
        await Bot.findByIdAndDelete(req.params.id);
        await createLog('USER_ACTION', `Bot silindi ID: ${req.params.id}`);
        res.json({ message: 'Bot silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 8. Users: Get All
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ joinDate: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 9. Logs: Get All
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 10. Stats
app.get('/api/stats/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeBots = await Bot.countDocuments({ status: 'active' });
        const logsCount = await Log.countDocuments();
        
        // Hasılat hesabı (Simülasyon - gerçek satış tablosu olmadığı için)
        const bots = await Bot.find();
        const potentialRevenue = bots.reduce((acc, b) => acc + (b.price || 0), 0) * 12; 

        res.json({
            totalUsers,
            totalRevenue: potentialRevenue,
            totalViews: logsCount * 5, // Simüle edilmiş görüntülenme
            activeBots
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
    console.log(`📡 API Adresi: http://localhost:${PORT}/api`);
});
