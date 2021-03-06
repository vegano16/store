const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
    check,
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const generateUniqueId = require('generate-unique-id');
const multer = require('multer');
/*const storage = multer.memoryStorage();*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});

const fileFilter = function fileFilter(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    // To reject this file pass `false`, like so:
    cb(null, false)

    // To accept the file pass `true`, like so:
    cb(null, true)

    // You can always pass an error if something goes wrong:
    cb(new Error('I don\'t have a clue!'))

};
const fs = require('fs');

const router = express.Router();


// create application/json parser
let jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({
    extended: false
})

let User = require('../models/user');
let Product = require('../models/product');


router.get('/', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) {
            console.log("No product found");
        } else {
            /*console.log(products);*/
            res.render('shopping', {
                nav: "Shopping",
                products: products
            })
            // res.render('index', {user: user})
        }
    })
});

//Product Categories
router.get('/category/:id', function (req, res) {

    Product.find({
        "category": req.params.id
    }, function (error, products) {
        res.render('category', {
            products: products,
            errors: "",
            nav: "Shopping > Category: " + req.params.id
        });
    })

});

//Update Route
router.get('/update/:id', function (req, res) {

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Product.findById(req.params.id, function (error, product) {
            res.render('update_product', {
                product: product,
                errors: "",
                nav: "Home > Product > Update > " + product.name + " " + product.model
            });
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
})

//Update Post
router.post('/update/:id', urlencodedParser, [
  check('category').not().isEmpty().withMessage("Product category is required"),
  check('name').not().isEmpty().withMessage("Product name is required"),
  check('price').not().isEmpty().withMessage("Product price is required"),
check('keywords').not().isEmpty().withMessage("Keywords are required"),
  check('details').not().isEmpty().withMessage("Product details required")
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(422).json({
            errors: errors.array()
        });

    } else {
        let product = {
            category: req.body.category,
            subcategory: req.body.subcategory,
            name: req.body.name,
            model: req.body.model,
            price: req.body.price,
            color: req.body.color,
            size: req.body.size,
            quality: req.body.quality,
            keywords: req.body.keywords,
            country: req.body.country,
            districts: req.body.districts,
            details: req.body.details,
            lastUpdated: new Date().toUTCString()
        };

        let query = {
            _id: req.params.id
        }

        Product.updateOne(query, product, function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log(req.params.id);
                req.flash('success', 'Update Successful!');
                res.redirect('/shopping/' + req.params.id);
                // res.json(newUser);
            }
        })
    }
});

//Post Route
router.get('/post-product', function (req, res) {
    res.render('post-product', {
        errors: "",
        data: "",
        nav: "Home > Products > Post-Product"
    });
});

//Post Product
router.post('/post-product', urlencodedParser, [
  check('category').not().isEmpty().withMessage("Product category is required"),
  check('name').not().isEmpty().withMessage("Product name is required"),
  check('price').not().isEmpty().withMessage("Product price is required"),
check('keywords').not().isEmpty().withMessage("Keywords are required"),
  check('details').not().isEmpty().withMessage("Product details required")
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        let data = {
            category: req.body.category,
            name: req.body.name,
            model: req.body.model,
            from: req.body.from,
            price: req.body.price,
            color: req.body.color,
            size: req.body.size,
            quality: req.body.quality,
            keywords: req.body.keywords,
            country: req.body.country,
            districts: req.body.districts,
            details: req.body.details
        }
        res.render('post-product', {
            errors: errors.array(),
            data: data,
            nav: "Home > Products > Post-Product"
        });
        return;
    } else {
        let newProduct = new Product({
            category: req.body.category,
            subcategory: req.body.subcategory,
            name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
            model: req.body.model.charAt(0).toUpperCase() + req.body.model.slice(1),
            from: req.body.from.charAt(0).toUpperCase() + req.body.from.slice(1),
            price: req.body.price,
            color: req.body.color,
            size: req.body.size,
            quality: req.body.quality,
            keywords: req.body.keywords,
            country: req.body.country,
            districts: req.body.districts,
            details: req.body.details,
            image: req.body.image,
            gallery: "http://res.cloudinary.com/bravo2020/image/upload/v1590094143/store/gallery/product.jpg.jpg",
            date: new Date().toUTCString(),
            by: req.user._id,
            lastUpdated: new Date().toUTCString(),
            approved: false,
            approved_by: "",
            productId: generateUniqueId({
                length: 8,
                useLetters: false
            })
        });
        newProduct.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log(newProduct._id);
                req.flash('success', 'Post Successful, Please Upload Images');
                res.redirect('/shopping/gallery/' + newProduct._id);
                // res.json(newUser);
            }
        })
    }
});

//Ajax get request to set product image(DP)
router.get('/gallery/productimage', urlencodedParser, function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.query.id)) {
        let query = {
            _id: req.query.id
        }
        let product = {
            image: req.query.image
        };
        Product.updateOne(query, product, function (err) {
            if (err) {
                console.log(err);
            } else {
                req.flash('success', 'Profile Image Updated!');
                res.send('Success');
            }
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
});

//Ajax get request to delete product image
router.get('/gallery/deleteimage', urlencodedParser, function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.query.id)) {
        let query = {
            _id: req.query.id
        }
        let productImage = {
            $pullAll: {
                'gallery': [req.query.image]
            }
        };
        Product.updateOne(query, productImage, function (err) {
            if (err) {
                console.log(err);
            } else {
                const cloudinary = require('cloudinary').v2;
                cloudinary.config({
                    cloud_name: 'bravo2020',
                    api_key: '944273769192317',
                    api_secret: 'WBX2LcP_kB9tKlMlAZc4E-4uy5w'
                });
                cloudinary.uploader.destroy(req.query.image, function (error, result) {
                    if (error) {
                        var message = error.message;
                        req.flash('warning', message);
                        res.send('Success');
                    } else if (result) {
                        console.log(result);
                        req.flash('success', 'Image Deleted!');
                        res.send('Success');
                    }
                })
            }
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
});

//Display product images/gallery
router.get('/gallery/:id', function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Product.findById(req.params.id, function (error, product) {
            res.render('gallery', {
                errors: "",
                images: product.gallery,
                id: req.params.id,
                nav: "Home > Product > " + product.name + " " + product.model
            });
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
});

//Post Product Image
router.post('/gallery/:id', upload.single('image'), function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Product.findById(req.params.id, function (error, product) {
            var galleryUrls = product.gallery || [];
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
                cloud_name: 'bravo2020',
                api_key: '944273769192317',
                api_secret: 'WBX2LcP_kB9tKlMlAZc4E-4uy5w'
            });
            /*console.log(req.file);*/
            if (req.file) {
                var path = req.file.path
                var newFilename = req.file.originalname
                /*console.log(newFilename);*/
                cloudinary.uploader.upload(path, {
                    public_id: `store/gallery/${newFilename}`
                }, function (error, result) {
                    if (error) {
                        console.log(error);
                    } else {
                        /*console.log(result.url);*/
                        galleryUrls.push(result.url);
                        let product = {
                            gallery: galleryUrls
                        };
                        let query = {
                            _id: req.params.id
                        }
                        Product.updateOne(query, product, function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('gallery', galleryUrls);
                                req.flash('success', 'Image Update Successful!');
                                res.redirect('/shopping/gallery/' + req.params.id);
                            }
                        })
                    }
                })
            } else {
                req.flash('warning', 'No image selected!');
                res.redirect('/shopping/gallery/' + req.params.id);
            }
        })
    }
});
router.get('/:id', function (req, res) {

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Product.findById(req.params.id, function (error, product) {
            res.render('product', {
                product: product,
                nav: "Product: " + product.name + " " + product.model
            });
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }

});

//Delete product
router.delete('/:id', function (req, res) {
    let query = {
        _id: req.params.id
    }
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Product.deleteOne(query, function (error) {
            if (error) {
                console.log(error);
            }
            req.flash('danger', 'Post Deleted!');
            res.send('Success');
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
})

//Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please log in');
        res.redirect('/login');
    }
}

module.exports = router;
