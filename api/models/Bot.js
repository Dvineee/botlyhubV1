
const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  price: { type: Number, default: 0 },
  category: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'passive'], default: 'active' },
  screenshots: [{ type: String }],
  features: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.models.Bot || mongoose.model('Bot', BotSchema);
