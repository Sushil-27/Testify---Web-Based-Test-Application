// routes/results.js
const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Test = require('../models/Test');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/authMiddleware');

// Submit result (student must be logged in)
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { userId, testId, answers } = req.body;
    if (!userId || !testId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing or invalid fields: userId, testId, answers are required.' });
    }
    // Fetch the test to get correct answers
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    // Calculate score
    let score = 0;
    for (let i = 0; i < test.questions.length; i++) {
      if (answers[i] !== undefined && answers[i] === test.questions[i].correctAnswer) {
        score++;
      }
    }
    const result = new Result({ userId, testId, answers, score });
    await result.save();
    console.log("✅ Result saved:", result);
    res.status(201).json({ message: "Result saved", score });
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).json({ error: "Failed to save result" });
  }
});

// Get results for a user (student must be logged in)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const results = await Result.find({ userId }).populate('testId');
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching student results", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Get analytics for a user (student must be logged in)
router.get('/analytics/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const results = await Result.find({ userId });
    if (!results.length) {
      return res.json({ totalTests: 0, averageScore: 0, highestScore: 0, lowestScore: 0 });
    }
    const scores = results.map(r => r.score);
    const totalTests = results.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    res.json({ totalTests, averageScore, highestScore, lowestScore });
  } catch (err) {
    console.error("❌ Error fetching analytics", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
