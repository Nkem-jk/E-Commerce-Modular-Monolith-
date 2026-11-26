const prisma = require("../../shared/config/db");
const cartRepository = require("../cart/cart.repository");
const productsRepository = require("../products/products.repository");
const ordersRepository = require("./orders.repository");
const selects = require("./orders.selects");
const AppError = require("../../shared/utils/AppError");
const { sendOrderConfirmationEmail } = require("../../shared/queue/emailQueue");

async function checkout(userId) {
  const order = await prisma.$transaction(async (tx) => {
    const cartItems = await cartRepository.findMany(
      {
        where: { userId },
        select: {
          productId: true,
          quantity: true,
          product: {
            select: { id: true, name: true, price: true, stock: true },
          },
        },
      },
      tx,
    );

    if (cartItems.length === 0) throw new AppError("Your cart is empty", 400);

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        throw new AppError(
          `Only ${item.product.stock} left of ${item.product.name}`,
          400,
        );
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = await ordersRepository.create(
      {
        data: {
          userId,
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        select: selects.order,
      },
      tx,
    );

    for (const item of cartItems) {
      await productsRepository.update(
        {
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
          select: { id: true },
        },
        tx,
      );
    }

    await cartRepository.deleteMany({ where: { userId } }, tx);

    
    return order;
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (user)
  sendOrderConfirmationEmail(user, order);

  return order;
}

async function getMyOrders(userId) {
  return ordersRepository.findMany({
    where: { userId },
    select: selects.order,
    orderBy: { createdAt: "desc" },
  });
}

async function getMyOrder(userId, orderId) {
  const order = await ordersRepository.findOne({
    where: { id: orderId, userId },
    select: selects.order,
  });

  if (!order) throw new AppError("Order not found", 404);

  return order;
}

async function cancelOrder(userId, orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await ordersRepository.findOne(
      {
        where: { id: orderId, userId },
        select: selects.cancelInfo,
      },
      tx,
    );

    if (!order) throw new AppError("Order not found", 404);

    if (order.status !== "pending") {
      throw new AppError("Only pending orders can be cancelled", 400);
    }

    for (const item of order.items) {
      await productsRepository.update(
        {
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
          select: { id: true },
        },
        tx,
      );
    }

    return ordersRepository.update(
      {
        where: { id: orderId },
        data: { status: "cancelled" },
        select: selects.order,
      },
      tx,
    );
  });
}

module.exports = { checkout, getMyOrders, getMyOrder, cancelOrder };