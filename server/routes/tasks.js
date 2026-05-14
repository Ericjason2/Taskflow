const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getTasks);
router.post('/', ctrl.createTask);
router.get('/:taskId', ctrl.getTask);
router.put('/:taskId', ctrl.updateTask);
router.delete('/:taskId', ctrl.deleteTask);
router.patch('/:taskId/status', ctrl.updateStatus);
router.post('/:taskId/comments', ctrl.addComment);
router.delete('/:taskId/comments/:commentId', ctrl.deleteComment);

module.exports = router;
