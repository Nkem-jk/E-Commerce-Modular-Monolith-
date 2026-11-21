const { Router } = require("express");

const router = Router();

router.use('/users', require('../modules/users/users.routes'));
router.use('/products', require('../modules/products/products.routes'));

module.exports = router;