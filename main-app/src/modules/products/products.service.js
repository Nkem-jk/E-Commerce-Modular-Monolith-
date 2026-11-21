const productsRepository = require("./products.repository");
const selects = require("./products.selects");  
const AppError = require("../../shared/utils/AppError");
const { generateProductDescription } = require("../../shared/integrations/groq");

async function ensureExists(id) {
    const product = await productsRepository.findOne({
        where: { id },
        select: selects.idOnly,
    });
    if (!product) { throw new AppError("Product not found", 404); };
}

async function getAllProducts() {
    return productsRepository.findMany({
        select: selects.publicProduct,
        orderBy: { createdAt: "desc" },
    });
}   

async function getProduct(id) {
    const product = await productsRepository.findOne({
        where: { id },
        select: selects.publicProduct,
    });
    if (!product) { throw new AppError("Product not found", 404); };
    return product;
}

async function addProduct(data) {
    if (!data.description) {
        data.description = await generateProductDescription({
            name: data.name,
            price: data.price,
        });
    }
return productsRepository.create({
     data, 
     select: selects.publicProduct });        
}

async function editProduct(id, data) {
    await ensureExists(id);

    return productsRepository.update({
        where: { id },
        data,
        select: selects.publicProduct,
    });
}

async function removeProduct(id) {
    await ensureExists(id);

    return productsRepository.delete({
        where: { id },
        select: selects.idOnly,
    });
}

async function checkStock(id) {
    const product = await productsRepository.findOne({
        where: { id },
        select: selects.stockOnly,
    });

    if (!product) { throw new AppError("Product not found", 404); };
    return product.stock > 0;
}

module.exports = {
    getAllProducts,
    getProduct,
    addProduct,
    editProduct,
    removeProduct,
    checkStock,
}; 