const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/search', menuController.searchMenu);
router.get('/group-by-category', menuController.groupByCategory);

router.post('/', menuController.createMenu);
router.get('/', menuController.getAllMenus);
router.get('/:id', menuController.getMenuById);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;