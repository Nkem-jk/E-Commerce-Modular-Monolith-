const { Router } = require("express");
const { authenticate } = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validate");
const schemas = require("./cart.validation");
const controller = require("./cart.controller");

const router = Router();

router.get("/", authenticate, controller.getCart);
router.post("/", authenticate, validate(schemas.add), controller.addToCart);
router.put("/:productId", authenticate, validate(schemas.update), controller.updateQuantity);
router.delete("/:productId", authenticate, controller.removeFromCart);

module.exports = router;