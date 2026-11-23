const ordersService = require("./orders.service");

async function checkout(req, res) {
  const order = await ordersService.checkout(req.user.id);

  res.status(201).json({ success: true, message: "Order placed", data: order });
}

async function getMyOrders(req, res) {
  const orders = await ordersService.getMyOrders(req.user.id);

  res.status(200).json({ success: true, message: "Orders retrieved", data: orders });
}

async function getMyOrder(req, res) {
  const order = await ordersService.getMyOrder(req.user.id, Number(req.params.id));

  res.status(200).json({ success: true, message: "Order retrieved", data: order });
}

async function cancelOrder(req, res) {
  const order = await ordersService.cancelOrder(req.user.id, Number(req.params.id));

  res.status(200).json({ success: true, message: "Order cancelled", data: order });
}

module.exports = { checkout, getMyOrders, getMyOrder, cancelOrder };