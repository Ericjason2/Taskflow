const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', ctrl.getStats);
router.get('/activities', ctrl.getActivities);
router.get('/', ctrl.getProjects);
router.post('/', ctrl.createProject);
router.get('/:id', ctrl.getProject);
router.put('/:id', ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);
router.post('/:id/members', ctrl.addMember);
router.delete('/:id/members/:userId', ctrl.removeMember);

module.exports = router;
