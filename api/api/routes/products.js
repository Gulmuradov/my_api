const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const check = require('../private/check')

const Product = require('../models/product');

router.get('/', (req, res, next) =>{
    Product.find()
    .select('name price _id')
    .exec()
    .then(docs=> {
        const response = {
            count: docs.length,
            products: docs.map(doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc.id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({})
    });
});

router.post('/', check, (req, res, next) =>{
    console.log(req.file);
     const newProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
     });
    newProduct.save()
     .then(result=> {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfeully saved',
            createdProduct: {
                name: result.name,
                price: result.price, 
                _id: result._id, 
                request: {
                    type: 'GET', 
                    url: 'http://localhost:3000/products/' + result._id 
                }
            }
        });
     })
     .catch(err=> {
        console.log(err);
        res.status(500).json({
            error: err
        })
     });
    
});

router.get('/:productId', (req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id')
    .exec()
    .then(doc=>{
        console.log("From the database",doc);
        if(doc){
            res.status(200).json({
                product: doc, 
                request: {
                    type: 'GET', 
                    url: 'http://localhost:3000/products'
                }
            })
        }else {
            res.status(404).json({message: "No valid entry found for provided ID"});

        }
    })
    .catch(err=> {
        console.log(err);
        res.status(500).json({error: err})
    });
})
router.patch('/:productId', check, (req, res, next)=>{
   const id = req.params.productId;
   const updateOps = {};
   for(const ops of req.body){
    updateOps[ops.propName] = ops.value;
   }
   Product.updateOne({_id: id}, {$set: updateOps})
   .exec()
   .then(result=> {
    
    res.status(200).json({
        message: 'Products updated',
        request: {
            type: 'GET', 
            url: 'http://localhost:3000/products/' + id 
        }
    })
   })
   .catch(err => {
    console.log(err)
    res.status(500).json({
        error: err
    });
   })
})
router.delete('/:productId', check, (req, res, next)=>{
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
    .exec()
    .then(result=> {
        res.status(200).json({
            message: 'Product deleted',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: {name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
 });

module.exports = router;