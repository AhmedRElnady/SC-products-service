const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
// const validate = require('../middlewares/validators');

const config = require('config');

// get all products [users]
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

// create a new product [admin] authorize
router.post('/', async (req, res, next) => {
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

// Edit details of specific Product
router.patch('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id,
            price = +req.body.price,
            description = req.body.description;

        // const productPrice = await Product.findById(productId).select('price');

        const oldProduct = await Product.findByIdAndUpdate(productId, {
            $set: {
                price,
                description
            }
        });

        console.log(">>> oldProduct >>>", oldProduct, oldProduct.price, price);
        if (!oldProduct) return res.status(404).json({ msg: `The product with this id ${productId} is not found !` })

        if (+oldProduct.price !== price) { // there a change in price 
            console.log(">>>> there a change in price  >>>>");
            // request the shopping-cart service to update 


        } 

        return res.status(200).json({
            msg: "found!"
        })




        // if there is a change in price, go to update shopping-cart service 
        // by REST or by publish an event (message), to update the shopping-carts 
        // that contains this product.


    } catch (e) {

    }
})

router.delete('/:id/', async (req, res, next) => {
    try {
        const productId = req.params.id;

        await Product.findByIdAndRemove(productId);
        // then update the shopping cart:
        return res.status(200).json({
            msg: 'Product is deleted successfully from all pending shopping carts'
        })
    } catch (e){

    }
})

module.exports = router;