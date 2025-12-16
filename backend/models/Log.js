
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'TRANSACTION', 'USER_ACTION'], required: true },
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed }
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

module.exports = mongoose.model('Log', LogSchema);
