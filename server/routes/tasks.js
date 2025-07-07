const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

router.get('/', tasksController.getAll);
router.post('/', tasksController.create);
router.patch('/:id', tasksController.update);
router.delete('/:id', tasksController.remove);

module.exports = router;
