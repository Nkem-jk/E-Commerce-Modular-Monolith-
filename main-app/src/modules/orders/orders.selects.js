const orderItem = {
  id: true,
  productId: true,
  quantity: true,
  price: true,
  product: {
    select: { id: true, name: true, imageUrl: true },
  },
};

module.exports = {
  order: {
    id: true,
    userId: true,
    status: true,
    total: true,
    createdAt: true,
    items: {
      select: orderItem,
    },
  },
  cancelInfo: {
    id: true,
    status: true,
    items: {
      select: { productId: true, quantity: true },
    },
  },
};