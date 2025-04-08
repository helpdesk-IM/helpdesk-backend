const express = require('express');
const router = express.Router();
const { verifyAdmin, verifyUser } = require('../auth/verifyToken.js')
const { createProducts, createProductModule, getAllProducts, updateProductModule, deleteProductModule } = require('../controller/product.controller.js')

router.post('/products', createProducts);
router.post('/productsModule', createProductModule);
router.get('/products',verifyUser, getAllProducts);
router.put('/products', updateProductModule)
router.delete('/products/:productId', deleteProductModule)

module.exports = router;