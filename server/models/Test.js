const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String], // 4 options
  correctAnswer: Number, // index of the correct option
});

const TestSchema = new mongoose.Schema({
  title: String,
  subject: String,
  duration: Number, // in minutes
  questions: [QuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Test', TestSchema);
