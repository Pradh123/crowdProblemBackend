const express = require('express');
const { check } = require('express-validator');
const { postProblem, updateProblem, deleteProblem, getProblems, getMyProblems, getProblemById, upvoteProblem, downvoteProblem, commentOnProblem } = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware').single('image');

const router = express.Router();

router.post('/', authMiddleware, upload, [
  check('location', 'Location is required').notEmpty(),
  check('description', 'Description is required').notEmpty()
], postProblem);

router.put('/:id', authMiddleware, upload, [
  check('location', 'Location is required').optional().notEmpty(),
  check('description', 'Description is required').optional().notEmpty()
], updateProblem);

router.delete('/:id', authMiddleware, deleteProblem);

router.get('/', getProblems);
router.get('/my', authMiddleware, getMyProblems);
router.get('/:id', getProblemById);

router.post('/:id/upvote', authMiddleware, upvoteProblem);
router.post('/:id/downvote', authMiddleware, downvoteProblem);
router.post('/:id/comment', authMiddleware, [
  check('text', 'Text is required').notEmpty()
], commentOnProblem);

module.exports = router;