
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Bot = require('./models/Bot');
const Log = require('./models/Log');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Bağlandı, veri ekleniyor...'))
  .catch(err => console.error(err));

const seedData = async () => {
    try {
        // Temizle
        await User.deleteMany({});
        await Bot.deleteMany({});
        await Log.deleteMany({});

        // 1. Admin Kullanıcısı
        const adminUser = await User.create({
            name: 'Sistem Yöneticisi',
            username: 'admin',
            password: 'admin123', // Şifrenizi buradan değiştirebilirsiniz
            role: 'Admin',
            status: 'Active',
            badges: ['Admin', 'Developer'],
            telegramId: 8426134237 // Özel Admin ID
        });
        console.log(`✅ Admin oluşturuldu: ${adminUser.username} / admin123`);

        // 2. Örnek Kullanıcılar
        await User.create([
            { name: 'Mehmet Yılmaz', username: 'mehmety', role: 'User', telegramId: 12345 },
            { name: 'Ayşe Demir', username: 'aysed', role: 'User', telegramId: 67890 },
            { name: 'Caner Bey', username: 'canerb', role: 'Moderator', badges: ['Mod'] }
        ]);

        // 3. Botlar
        await Bot.create([
            { name: 'Task Master', description: 'Görevleri profesyonelce yönetin.', price: 29.99, category: 'productivity', icon: 'https://picsum.photos/seed/task/200', isPremium: true },
            { name: 'GameBot Pro', description: 'Oyun sunucusu yönetimi ve skor takibi.', price: 0, category: 'games', icon: 'https://picsum.photos/seed/game/200' },
            { name: 'CryptoAlert', description: 'Kripto para fiyat alarmları.', price: 99.99, category: 'finance', icon: 'https://picsum.photos/seed/crypto/200', isPremium: true },
            { name: 'MusicFy', description: 'Yüksek kaliteli müzik yayını.', price: 19.99, category: 'music', icon: 'https://picsum.photos/seed/music/200' },
            { name: 'ModBot Ultra', description: 'AI destekli moderasyon aracı.', price: 49.50, category: 'moderation', icon: 'https://picsum.photos/seed/mod/200', isPremium: true }
        ]);
        console.log('✅ Botlar eklendi.');

        await Log.create({ type: 'INFO', message: 'Veritabanı seed işlemi tamamlandı.' });

        console.log('🚀 Seed işlemi tamamlandı! Çıkış yapılıyor.');
        process.exit();
    } catch (error) {
        console.error('Seed Hatası:', error);
        process.exit(1);
    }
};

seedData();
