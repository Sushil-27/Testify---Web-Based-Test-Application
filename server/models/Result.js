// backend/models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  answers: [Number],
  score: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
