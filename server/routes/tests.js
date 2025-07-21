const router = require('express').Router();
const Test = require('../models/Test');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Create new test (Admin Only)
router.post('/create', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log("Test Data Received:", req.body);  // ✅ Add this line

    const test = new Test(req.body);
    await test.save();
    res.json({ msg: "Test created successfully!" });
  } catch (err) {
    console.error("Error creating test:", err);  // ✅ Log the error
    res.status(500).json({ msg: "Error creating test", error: err });
  }
});

// List all tests (for students)
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find({});
    res.json(tests);
  } catch (err) {
    console.error("Error fetching tests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ msg: "Test not found" });
    res.json(test);
  } catch (err) {
    console.error("Error fetching test:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
