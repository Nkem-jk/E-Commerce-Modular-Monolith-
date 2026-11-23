const { Router } = require("express");

const router = Router();

router.use('/users', require('../modules/users/users.routes'));
router.use('/products', require('../modules/products/products.routes'));
router.use('/cart', require('../modules/cart/cart.routes'));
router.use('/orders', require('../modules/orders/orders.routes'));

module.exports = router;