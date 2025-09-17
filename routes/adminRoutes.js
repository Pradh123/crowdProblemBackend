const express = require('express');
const { getAllUsers, getUserById, banUser, deleteProblem, deleteSolution } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/ban', banUser);
router.delete('/problems/:problemId', deleteProblem);
router.delete('/solutions/:solutionId', deleteSolution);

module.exports = router;