
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  telegramId: { type: Number, unique: true, sparse: true }, // Telegram ID
  password: { type: String }, // Sadece admin paneli girişi için
  avatar: { type: String },
  role: { type: String, enum: ['Admin', 'User', 'Moderator'], default: 'User' },
  status: { type: String, enum: ['Active', 'Passive'], default: 'Active' },
  badges: [{ type: String }],
  joinDate: { type: Date, default: Date.now },
  email: { type: String }
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Şifreyi asla client'a gönderme
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
