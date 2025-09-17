const User = require('../models/User');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const banUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, { isBanned: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProblem = async (req, res) => {
  const { problemId } = req.params;
  try {
    const problem = await Problem.findByIdAndDelete(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSolution = async (req, res) => {
  const { solutionId } = req.params;
  try {
    const solution = await Solution.findByIdAndDelete(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });
    res.json({ message: 'Solution deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, banUser, deleteProblem, deleteSolution };