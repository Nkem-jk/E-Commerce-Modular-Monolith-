module.exports = {
    //returns all product lists, details, and after create or update
    publicProduct: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        createdAt: true,
        updatedAt: true
    },

    //existence check: just tp know the row is there
    idOnly: { id: true },

    //stock check: just to know the stock count is needed
    stockOnly: { stock: true }
};