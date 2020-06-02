const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {
    check,
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();


// create application/json parser
let jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({
    extended: false
})


let User = require('../models/user');
let Product = require('../models/product');

//Admin dashboard
router.get('/dashboard/:id', function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        User.find({}, function (err, users) {
            if (err) {
                console.log(err);
            } else {

                Product.find({}, function (err, products) {

                    if (err) {
                        console.log(err);
                    } else {

                        let usercount = users.length;
                        let productcount = products.length;
                        res.render('dashboard', {
                            products: products,
                            usercount: usercount,
                            productcount: productcount,
                            errors: "",
                            nav: "Home > Admin > " + req.params.id
                        });
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

router.get('/overview/:id', function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        User.find({}, function (err, users) {
            if (err) {
                console.log(err);
            } else {

                Product.find({}, function (err, products) {

                    if (err) {
                        console.log(err);
                    } else {

                        let usercount = users.length;
                        let productcount = products.length;
                        res.render('overview', {
                            products: products,
                            usercount: usercount,
                            productcount: productcount,
                            errors: "",
                            nav: "Home > Admin > Overview "
                        });
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



module.exports = router;
