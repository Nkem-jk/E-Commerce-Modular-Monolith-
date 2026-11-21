const { Router } = require("express");
const controller = require("./products.controller");
const schemas = require("./products.validation");
const validate = require("../../shared/middlewares/validate");
const { authenticate } = require("../../shared/middlewares/auth");

const router = Router();

router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.get("/:id/stock", controller.stockCheck);
router.post("/", authenticate, validate(schemas.create), controller.addProduct);
router.put("/:id", authenticate, validate(schemas.update), controller.editProduct);
router.delete("/:id", authenticate, controller.removeProduct);

module.exports = router;