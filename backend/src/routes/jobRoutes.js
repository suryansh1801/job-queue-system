const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobController');

router.post('/', controller.submitJob);
router.get('/', controller.getAllJobs);
router.get('/:id', controller.getJob);

module.exports = router;