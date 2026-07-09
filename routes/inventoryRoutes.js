const express = require('express');
const router = express.Router();
const { getAllStatus, updateStock } = require('../controllers/inventoryController');

router.get('/status', getAllStatus);
router.patch('/:id', updateStock);

module.exports = router;
