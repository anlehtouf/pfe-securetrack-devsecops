const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { authenticate } = require('../middleware/auth');

// All incident routes require authentication
router.use(authenticate);

router.get('/', incidentController.list);
router.post('/', incidentController.create);
router.get('/stats', incidentController.stats);
router.get('/:id', incidentController.getById);
router.patch('/:id', incidentController.update);

module.exports = router;
