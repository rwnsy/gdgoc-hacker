const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Route Spesifik (Taruh di ATAS route yang pakai :id)
router.get('/search', menuController.searchMenu);
router.get('/group-by-category', menuController.groupByCategory);

// Route CRUD Standar
router.post('/', menuController.createMenu);
router.get('/', menuController.getAllMenus);
router.get('/:id', menuController.getMenuById);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;