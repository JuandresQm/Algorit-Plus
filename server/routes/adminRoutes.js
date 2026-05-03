const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/users', verifyToken, authorizeRoles('admin'), adminController.getAllUsers);
router.get('/logs', verifyToken, authorizeRoles('admin'), adminController.getLogs);
router.get('/backup', verifyToken, authorizeRoles('admin'), adminController.downloadBackup);
router.put('/user/role/:id', verifyToken, authorizeRoles('admin'), adminController.updateUserRole);

module.exports = router;