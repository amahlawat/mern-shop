const fs = require('fs');
const path = require('path');

const Product = require('../models/product');

// create
exports.postAddProduct = (req, res, next) => {
    // console.log(req.body);
    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const description = req.body.description;
    let creator;
    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        description: description
    });
    product.save()
        .then(result => {
            res.status(201).json({ 
                success: "true", 
                message: 'product created successfully!',
                product: product
            });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

// read
exports.getProducts = (req, res, next) => {
    Product.find()
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Product.find()       
    })
    .then(products => {
        res.status(200)
        .json({
            message: 'Fetched products successfully',
            products: products,
            totalItems: totalItems
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    });
}

// read a single product
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then(product => {
        if(!product){
            const error = new Error('could not find product');
            error.statusCode = 404;
            throw error;
        }
        res.status(200)
        .json({
            message: 'Fetched product successfully',
            product: product
        })        
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

// update
exports.postUpdateProducts = (req, res, next) => {
    // console.log(req.params.productId);
    // res.status(200).json({ message: 'ok' });
    const productId = req.params.productId;
    const formData = req.body;
    console.log(formData);
    Product.findById(productId)
    .then(product => { 
        if(!product){
            const error = new Error('could not find product');
            error.statusCode = 404;
            throw error;
        }
        return Product.findByIdAndUpdate({_id: productId }, formData)
    })
    .then(result => {
        // console.log(result);
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

// delete 
exports.deleteProduct = (req, res, next) => {
    const id = req.query.id;
    Product.findById(id)
    .then(product => {
        // console.log(product);
        if(!product){
            const error = new Error("Could not find product");
            error.statusCode = 404;
            throw error;
        }
        clearImage(product.imageUrl);
        return Product.findByIdAndRemove(id);    
    })
    .then(result => {
        return Product.findById(id);
    })
    .then(result => {
        res.status(200).json({ message: 'Deleted product '});
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));    
}