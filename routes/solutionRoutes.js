const express = require('express');
const { check } = require('express-validator');
const { suggestSolution, updateSolution, deleteSolution, getSolutionsByProblem, upvoteSolution, downvoteSolution, commentOnSolution } = require('../controllers/solutionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:problemId', authMiddleware, [
  check('text', 'Text is required').notEmpty()
], suggestSolution);

router.put('/:solutionId', authMiddleware, [
  check('text', 'Text is required').optional().notEmpty()
], updateSolution);

router.delete('/:solutionId', authMiddleware, deleteSolution);

router.get('/:problemId', getSolutionsByProblem);

router.post('/:solutionId/upvote', authMiddleware, upvoteSolution);
router.post('/:solutionId/downvote', authMiddleware, downvoteSolution);
router.post('/:solutionId/comment', authMiddleware, [
  check('text', 'Text is required').notEmpty()
], commentOnSolution);

module.exports = router;