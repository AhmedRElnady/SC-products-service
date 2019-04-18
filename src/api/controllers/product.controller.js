const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validators');

const apiAdapter = require('../../config/api-adapter/api-adapter'),
    cartMSURL = config.get('MS.cart.url'),
    cartMSPrefix = config.get('MS.cart.prefix');

const config = require('config');

/* 
    This route does not have any kind of authentication or authorization rules
    any body can list products.
*/
router.get('/', async (req, res, next) => {
    try {
        // todo: pagination
        const products = await Product.find({});

        res.status(200).json({
            msg: ">> In The Name Of ALLAH",
            data: products
        })
    } catch (e) {

    }
});

/* 
    This route does not have any kind of authentication or authorization rules
    any body can show a specific product.
*/
router.get('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: `The product with this id ${productId} is not found ! ` })

        res.status(200).json({
            data: product
        })
    } catch (e) {

    }
})

// create a new product [admin] 
router.post('/', authorize(), async (req, res, next) => {
    try {
        const createdProduct = await Product.create({
            name: req.body.name,
            inventory: req.body.inventory,
            price: req.body.price,
            description: req.body.description
        });

        res.status(201).json({
            msg: 'Product is created successfully.'
        })
    } catch (e) {

    }
})

// Edit details of specific Product [admin]
router.patch('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id,
            price = +req.body.price,
            description = req.body.description;

        const oldProduct = await Product.findByIdAndUpdate(productId, {
            $set: {
                price,
                description
            }
        });

        console.log(">>> oldProduct >>>", oldProduct, oldProduct.price, price);
        if (!oldProduct) return res.status(404).json({ msg: `The product with this id ${productId} is not found !` })

        if (+oldProduct.price !== price) { // there is a change in price 
            
            console.log(">>>> there a change in price  >>>>");

            // request the shopping-cart service to update the product price in all pending carts  
            const cartAdapter = apiAdapter(cartMSURL);
            const cartRes = await cartAdapter.patch(`/${cartMSPrefix}/items/${productId}`, { newPrice: price });

        }

        return res.status(200).json({
            msg: "product is updated successfully !"
        })
    } catch (e) {

    }
})

router.delete('/:id/', async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        await Product.findByIdAndRemove(productId);
        // then update the shopping cart:
        const cartAdapter = apiAdapter(cartMSURL);
        const cartRes = await cartAdapter.delete(`/${cartMSPrefix}/items/${productId}`)
        
        return res.status(200).json({
            msg: 'Product is deleted successfully from all pending shopping carts'
        })
    } catch (e) {

    }
})

module.exports = router;