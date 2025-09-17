const Solution = require('../models/Solution');
const Problem = require('../models/Problem');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

const suggestSolution = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text } = req.body;
  const { problemId } = req.params;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const solution = new Solution({
      text,
      problem: problemId,
      user: req.user.id,
    });
    await solution.save();
    res.status(201).json(solution);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSolution = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text } = req.body;
  const { solutionId } = req.params;

  try {
    let solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    if (solution.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    solution.text = text || solution.text;
    await solution.save();
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSolution = async (req, res) => {
  const { solutionId } = req.params;

  try {
    const solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    if (solution.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Solution.findByIdAndDelete(solutionId);
    res.json({ message: 'Solution deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSolutionsByProblem = async (req, res) => {
  const { problemId } = req.params;

  try {
    const solutions = await Solution.find({ problem: problemId }).populate('user', 'username').populate('comments');
    res.json(solutions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const upvoteSolution = async (req, res) => {
  const { solutionId } = req.params;

  try {
    const solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    const userId = req.user.id;
    const isUpvoted = solution.upvotes.includes(userId);
    const isDownvoted = solution.downvotes.includes(userId);

    if (isUpvoted) {
      solution.upvotes = solution.upvotes.filter(uid => uid.toString() !== userId);
    } else {
      solution.upvotes.push(userId);
      if (isDownvoted) {
        solution.downvotes = solution.downvotes.filter(uid => uid.toString() !== userId);
      }
    }

    await solution.save();
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const downvoteSolution = async (req, res) => {
  const { solutionId } = req.params;

  try {
    const solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    const userId = req.user.id;
    const isDownvoted = solution.downvotes.includes(userId);
    const isUpvoted = solution.upvotes.includes(userId);

    if (isDownvoted) {
      solution.downvotes = solution.downvotes.filter(uid => uid.toString() !== userId);
    } else {
      solution.downvotes.push(userId);
      if (isUpvoted) {
        solution.upvotes = solution.upvotes.filter(uid => uid.toString() !== userId);
      }
    }

    await solution.save();
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const commentOnSolution = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text } = req.body;
  const { solutionId } = req.params;

  try {
    const solution = await Solution.findById(solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    const comment = new Comment({
      text,
      user: req.user.id,
      solution: solutionId,
    });
    await comment.save();

    solution.comments.push(comment._id);
    await solution.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { suggestSolution, updateSolution, deleteSolution, getSolutionsByProblem, upvoteSolution, downvoteSolution, commentOnSolution };