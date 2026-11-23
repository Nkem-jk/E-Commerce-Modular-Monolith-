const cartService = require("./cart.service");

async function getCart(req, res) {
  const items = await cartService.getCart(req.user.id);

  res.status(200).json({ success: true, message: "Cart retrieved", data: items });
}

async function addToCart(req, res) {
  const item = await cartService.addToCart(req.user.id, req.body);

  res.status(201).json({ success: true, message: "Product added to cart", data: item });
}

async function updateQuantity(req, res) {
  const item = await cartService.updateQuantity(
    req.user.id,
    Number(req.params.productId),
    req.body.quantity,
  );

  res.status(200).json({ success: true, message: "Cart updated", data: item });
}

async function removeFromCart(req, res) {
  await cartService.removeFromCart(req.user.id, Number(req.params.productId));

  res.status(200).json({ success: true, message: "Item removed from cart" });
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart };