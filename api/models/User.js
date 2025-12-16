
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  telegramId: { type: Number, unique: true, sparse: true },
  password: { type: String },
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
      delete ret.password;
    }
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
