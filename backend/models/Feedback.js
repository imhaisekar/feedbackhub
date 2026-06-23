const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Bug Report', 'Feature Request', 'Complaint', 'Suggestion'],
    default: 'General'
  },
  rating: { type: Number, min: 1, max: 5 },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  // Version history - saves previous edits
  history: [{
    title: String,
    message: String,
    category: String,
    rating: Number,
    editedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
