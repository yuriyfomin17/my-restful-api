const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/orders')
const Product = require('../models/products')
//Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })

            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })
})

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not Found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            })
            return order.save()
                .then(result => {
                    console.log(result)
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    })
                })
                .catch(error => {
                    console.log(error)
                    res.status(500).json({
                        error: error
                    })

                })
                .catch(error => {
                    res.status(500).json({
                        message: 'Product',
                        error: error
                    })
                })

        })

})

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .exec()
        .then(order => {
            if(!order){
                return res.status(404).json({
                    message:"Order not found"
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })
})

router.delete('/:orderId', (req, res, next) => {
    Order.remove({_id: req.params.orderId})
        .exec()
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: 'Order deleted',
                request: {
                    type: "POST",
                    url: "http://localhost:3000/orders",
                    body: {productId: "ID", quantity: "Number"}
                }
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })
})

module.exports = router;