const router = require('express').Router();
const { validateCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.post('/validate', protect, validateCart);

module.exports = router;
