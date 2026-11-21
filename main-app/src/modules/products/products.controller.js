const productsService = require("./products.service");

async function getProducts(req, res) {
    const products = await productsService.getAllProducts();

    res.status(200).json({ success: true, message: "Products retrieved successfully", data: products });
}   

async function getProduct(req, res) {
    const product = await productsService.getProduct(Number(req.params.id));

    res.status(200).json({ success: true, message: "Product retrieved successfully", data: product });
}

async function addProduct(req, res) {
    const product = await productsService.addProduct(req.body);

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
}

async function editProduct(req, res) {
    const product = await productsService.editProduct(Number(req.params.id), req.body);

    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
}

async function removeProduct(req, res) {
    await productsService.removeProduct(Number(req.params.id));

    res.status(200).json({ success: true, message: "Product deleted successfully" });
}

async function stockCheck(req, res) {
    const inStock = await productsService.checkStock(Number(req.params.id));

    res.status(200).json({ success: true, message: "Stock checked successfully", data: { inStock } });
}

module.exports = {
    getProducts,
    getProduct,
    addProduct,
    editProduct,
    removeProduct,
    stockCheck  
};