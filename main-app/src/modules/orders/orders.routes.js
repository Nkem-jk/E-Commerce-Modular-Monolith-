const { Router } = require("express");
const { authenticate } = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validate");
const controller = require("./orders.controller");
const { orderIdParams } = require("./orders.validation");

const router = Router();

router.post("/", authenticate, controller.checkout);
router.get("/", authenticate, controller.getMyOrders);
router.get("/:id", authenticate, validate(orderIdParams), controller.getMyOrder);
router.put("/:id/cancel", authenticate, validate(orderIdParams), controller.cancelOrder);

module.exports = router;