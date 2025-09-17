const Problem = require('../models/Problem');
const cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');
const streamifier = require('streamifier');

const postProblem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { location, description } = req.body;
  let image = null;

  try {
    if (req.file) {
      // Create a promise for the Cloudinary upload
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      image = { url: uploadResult.url, public_id: uploadResult.public_id };
    }

    const problem = new Problem({
      location,
      description,
      image,
      user: req.user.id,
    });
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProblem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { location, description } = req.body;
  const { id } = req.params;

  try {
    let problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    if (problem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let image = problem.image;
    if (req.file) {
      // Delete the old image from Cloudinary if it exists
      if (image && image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      // Upload the new image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      image = { url: uploadResult.url, public_id: uploadResult.public_id };
    }

    problem.location = location || problem.location;
    problem.description = description || problem.description;
    problem.image = image;

    await problem.save();
    res.json(problem);
  } catch (err) {
    console.error('Error in updateProblem:', err); // Log error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    if (problem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (problem.image && problem.image.public_id) {
      await cloudinary.uploader.destroy(problem.image.public_id);
    }

    await Problem.findByIdAndDelete(id);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ user: req.user.id }).populate('user', 'username').sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('user', 'username').populate('comments');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const upvoteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const userId = req.user.id;
    const isUpvoted = problem.upvotes.includes(userId);
    const isDownvoted = problem.downvotes.includes(userId);

    if (isUpvoted) {
      problem.upvotes = problem.upvotes.filter(uid => uid.toString() !== userId);
    } else {
      problem.upvotes.push(userId);
      if (isDownvoted) {
        problem.downvotes = problem.downvotes.filter(uid => uid.toString() !== userId);
      }
    }

    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const downvoteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const userId = req.user.id;
    const isDownvoted = problem.downvotes.includes(userId);
    const isUpvoted = problem.upvotes.includes(userId);

    if (isDownvoted) {
      problem.downvotes = problem.downvotes.filter(uid => uid.toString() !== userId);
    } else {
      problem.downvotes.push(userId);
      if (isUpvoted) {
        problem.upvotes = problem.upvotes.filter(uid => uid.toString() !== userId);
      }
    }

    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const commentOnProblem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text } = req.body;
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const comment = new Comment({
      text,
      user: req.user.id,
      problem: id, // Added for comments on problems
    });
    await comment.save();

    problem.comments.push(comment._id);
    await problem.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { postProblem, updateProblem, deleteProblem, getProblems, getMyProblems, getProblemById, upvoteProblem, downvoteProblem, commentOnProblem };