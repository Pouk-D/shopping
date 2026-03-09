const router = require('express').Router();
const { getUsers, getUserStats, createAdmin, setUserRole, resetPassword } = require('../controllers/userController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');

router.get('/',       protect, adminOnly,      getUsers);
router.get('/stats',  protect, adminOnly,      getUserStats);
router.post('/create-admin',  protect, superAdminOnly, createAdmin);
router.put('/:id/role',       protect, superAdminOnly, setUserRole);
router.put('/:id/reset-password', protect, superAdminOnly, resetPassword);

module.exports = router;
