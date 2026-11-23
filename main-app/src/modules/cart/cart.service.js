const cartRepository = require("./cart.repository");
const productsRepository = require("../products/products.repository");
const selects = require("./cart.selects");
const AppError = require("../../shared/utils/AppError");

async function checkStock(productId, quantity) {
  const product = await productsRepository.findOne({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) throw new AppError("Product not found", 404);

  if (quantity > product.stock) {
    throw new AppError(`Only ${product.stock} left in stock`, 400);
  }
}

async function getCart(userId) {
  return cartRepository.findMany({
    where: { userId },
    select: selects.cartItem,
    orderBy: { createdAt: "asc" },
  });
}

async function addToCart(userId, { productId, quantity }) {
  const existing = await cartRepository.findOne({
    where: { userId, productId },
    select: selects.quantityOnly,
  });

  const newQuantity = existing ? existing.quantity + quantity : quantity;

  await checkStock(productId, newQuantity);

  if (existing) {
    return cartRepository.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity: newQuantity },
      select: selects.cartItem,
    });
  }

  return cartRepository.create({
    data: { userId, productId, quantity: newQuantity },
    select: selects.cartItem,
  });
}

async function updateQuantity(userId, productId, quantity) {
  await checkStock(productId, quantity);

  return cartRepository.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
    select: selects.cartItem,
  });
}

async function removeFromCart(userId, productId) {
  return cartRepository.delete({
    where: { userId_productId: { userId, productId } },
    select: selects.idOnly,
  });
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart };