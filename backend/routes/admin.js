const router = require('express').Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendStatusEmail } = require('../middleware/mailer');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only.' });
  next();
};

// Get all feedbacks with search, filter, pagination
router.get('/feedbacks', auth, adminOnly, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 8 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } }
    ];

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Feedback.countDocuments(filter);
    const unread = await Feedback.countDocuments({ status: 'pending', isRead: false });

    res.json({ feedbacks, total, pages: Math.ceil(total / limit), unread });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedbacks.' });
  }
});

// Approve or Reject with optional note + email notification
router.patch('/feedback/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '', isRead: true },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

    // Send email notification to user
    try {
      await sendStatusEmail(feedback.userEmail, feedback.userName, feedback.title, status, adminNote);
    } catch (e) {
      console.log('Email notification failed:', e.message);
    }

    res.json({ message: `Feedback ${status} successfully.`, feedback });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update feedback.' });
  }
});

// Analytics
router.get('/analytics', auth, adminOnly, async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: 'pending' });
    const approved = await Feedback.countDocuments({ status: 'approved' });
    const rejected = await Feedback.countDocuments({ status: 'rejected' });
    const totalUsers = await User.countDocuments({ role: 'user', isVerified: true });

    const byCategory = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const avgRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const recentActivity = await Feedback.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    res.json({
      total, pending, approved, rejected, totalUsers,
      byCategory, byRating,
      avgRating: avgRating[0]?.avg?.toFixed(1) || '0',
      recentActivity: recentActivity.reverse()
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
});

// Export as CSV
router.get('/export/csv', auth, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    const rows = [
      ['Name', 'Email', 'Category', 'Rating', 'Title', 'Message', 'Status', 'Admin Note', 'Date'],
      ...feedbacks.map(f => [
        f.userName, f.userEmail, f.category, f.rating || '',
        `"${f.title.replace(/"/g, '""')}"`,
        `"${f.message.replace(/"/g, '""')}"`,
        f.status, f.adminNote || '',
        new Date(f.createdAt).toLocaleDateString('en-IN')
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=feedbackhub-export.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Export failed.' });
  }
});

// Mark all as read
router.patch('/mark-read', auth, adminOnly, async (req, res) => {
  try {
    await Feedback.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
});

module.exports = router;
