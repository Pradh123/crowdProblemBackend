const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solution: { type: mongoose.Schema.Types.ObjectId, ref: 'Solution' },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }, // Added for comments on problems
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);