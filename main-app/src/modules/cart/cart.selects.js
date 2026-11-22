module.exports ={
    cartItem: {
        id: true,
        productId: true,
        quantity: true,
        createdAt: true,
        product: {
            select: {id: true, name: true, price: true, imageUrl: true, stock: true},
        },
    },
    quantityOnly : { quantity: true },
    idOnly: { id: true }
};