const router = require('express').Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Submit feedback
router.post('/submit', auth, async (req, res) => {
  try {
    const { category, rating, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });

    const feedback = new Feedback({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      category: category || 'General',
      rating, title, message
    });
    await feedback.save();
    res.json({ message: 'Feedback submitted successfully!', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit feedback.', error: err.message });
  }
});

// Get my feedbacks
router.get('/my', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your feedback.' });
  }
});

// Edit feedback (only if pending, saves version history)
router.put('/edit/:id', auth, async (req, res) => {
  try {
    const { title, message, category, rating } = req.body;
    const feedback = await Feedback.findOne({ _id: req.params.id, userId: req.user.id });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
    if (feedback.status !== 'pending') return res.status(400).json({ message: 'Only pending feedback can be edited.' });

    // Save current version to history before editing
    feedback.history.push({ title: feedback.title, message: feedback.message, category: feedback.category, rating: feedback.rating });
    feedback.title = title || feedback.title;
    feedback.message = message || feedback.message;
    feedback.category = category || feedback.category;
    feedback.rating = rating || feedback.rating;
    feedback.updatedAt = new Date();
    await feedback.save();

    res.json({ message: 'Feedback updated. Previous version saved.', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update feedback.' });
  }
});

// Get approved feedbacks for Pulse Wall
router.get('/pulse', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ status: 'approved', rating: { $gte: 4 } })
      .sort({ updatedAt: -1 }).limit(10)
      .select('userName rating message category updatedAt');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pulse.' });
  }
});

module.exports = router;
