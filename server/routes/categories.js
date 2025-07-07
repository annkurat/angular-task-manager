const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.get('/:id', categoriesController.get);
router.patch('/:id', categoriesController.update);
router.delete('/:id', categoriesController.remove);

module.exports = router;
