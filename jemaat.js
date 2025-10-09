const express = require('express');
const router = express.Router();
const jemaatController = require('../controllers/jemaatController');
const { isAdmin } = require('../middleware/authMiddleware');

router.use(isAdmin); // Hanya Admin yang bisa mengakses modul ini

router.get('/', jemaatController.getAllJemaat);
router.post('/', jemaatController.createJemaat);
router.put('/:id', jemaatController.updateJemaat);
router.delete('/:id', jemaatController.deleteJemaat);

module.exports = router;
