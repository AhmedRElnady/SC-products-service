const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validators');

const config = require('config');

const apiAdapter = require('../../config/api-adapter/api-adapter'),
    cartMSURL = config.get('MS.cart.url'),
    cartMSPrefix = config.get('MS.cart.prefix');


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

        return res.status(200).json({
            data: product
        })
    } catch (e) {

    }
})

// create a new product [admin] 
router.post('/', authorize(), validate(), async (req, res, next) => {
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
router.patch('/:id', authorize(), async (req, res, next) => {
    try {
        const productId = req.params.id,
            name = req.body.name,
            price = +req.body.price,
            description = req.body.description;

        const oldProduct = await Product.findByIdAndUpdate(productId, {
            $set: {
                name,
                price,
                description
            }
        });
        if (!oldProduct) return res.status(404).json({ msg: `The product with this id ${productId} is not found !` })

        // there is a change in price 
        if (+oldProduct.price !== price) {
            // request the shopping-cart service to update the product price in all pending carts  
            const cartAdapter = apiAdapter(cartMSURL);
            await cartAdapter.patch(`/${cartMSPrefix}/items/${productId}`, { newPrice: price });
        }

        return res.status(200).json({
            msg: "product is updated successfully !"
        })
    } catch (e) {

    }
})

router.delete('/:id', authorize(), async (req, res, next) => {
    try {
        const productId = req.params.id;

        await Product.findByIdAndRemove(productId);
        // then update the shopping cart:
        const cartAdapter = apiAdapter(cartMSURL);
        await cartAdapter.delete(`/${cartMSPrefix}/items/${productId}`)

        return res.status(200).json({
            msg: 'Product is deleted successfully from all pending shopping carts'
        })
    } catch (e) {
    }
})

///////////////////////////////////////////////////////////////////////////////////////////
//////////////// private routes (can NOT accessed directly from api gateway, 
////////////////           other services can call them internally) 
///////////////////////////////////////////////////////////////////////////////////////////
// Todo: send the orderedQuantity as QueryString instead
// to check the availabiltity of a specific product [existence and amount]
router.get('/:productId/isAvailable/:orderedQuantity', async (req, res, next) => {
    const productId = req.params.productId,
        orderedQuantity = req.params.orderedQuantity;

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).send(-1)
    } else if (product.inventory < orderedQuantity) {
        return res.status(200).send(0)
    }

    return res.status(200).send({
        prodPrice: product.price
    });

});

// Todo: make just one function to increment or decrement.
// to increment product inventory (none CRUD operations like github)
router.post('/:productId/inventory/:orderedQuantity', async (req, res, next) => {
    const productId = req.params.productId,
        orderedQuantity = +req.params.orderedQuantity;

    await Product.updateOne({ _id: productId }, {
        $inc: {
            inventory: orderedQuantity
        }
    })

    return res.status(200).send({ msg: "product's inventory is incremented ...." });

});
// to decrement product inventory
router.delete('/:productId/inventory/:orderedQuantity', async (req, res, next) => {
    const productId = req.params.productId,
        orderedQuantity = +req.params.orderedQuantity;

    await Product.updateOne({ _id: productId }, {
        $inc: {
            inventory: -orderedQuantity
        }
    })

    return res.status(200).send({ msg: "product's inventory is decremented ...." });
});

module.exports = router;