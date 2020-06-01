const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {
    check,
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

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


// create application/json parser
let jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({
    extended: false
})

let User = require('../models/user');


router.get('/login', function (req, res) {
    res.render('login', {
        nav: "Home > Users > Log in"
    });
})

router.post('/login', urlencodedParser, function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: 'Invalid username or password.',
        successFlash: 'You are now logged in'
    })(req, res, next);
})

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('danger', 'You are logged out.');
    res.redirect('/users/login');
})

router.get('/register', function (req, res) {
    res.render('register', {
        errors: "",
        data: "",
        nav: "Home > Users > Register"
    });
})

router.post('/register', urlencodedParser, [

  check('username').not().isEmpty().withMessage("Username is required").custom((value, {
        req
    }) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                username: req.body.username
            }, function (err, user) {
                if (err) {
                    reject(new Error("Server Error"))
                }
                if (Boolean(user)) {
                    reject(new Error("Username already in use"))
                }
                resolve(true);
            })
        })
    }),

  check('fname').not().isEmpty().withMessage("First name is required").isLength({
        min: 3
    }).withMessage('Name must be at least 3 chars long'),
  check('lname').not().isEmpty().withMessage("Last name is required").isLength({
        min: 3
    }).withMessage('Name must be at least 3 chars long'),
  check('email').not().isEmpty().withMessage("Email is required").isEmail().normalizeEmail().withMessage('Email is invalid'),
  check('phone').not().isEmpty().withMessage("Phone number is required").isLength({
        min: 10
    }).withMessage('Invalid phone number'),
    check('gender').not().isEmpty().withMessage("Gender is required"),
  check('username').not().isEmpty().withMessage("Username is required").isLength({
        min: 3
    }).withMessage('Username must be at least 3 chars long'),
  check('password').not().isEmpty().withMessage("Password is required").isLength({
        min: 5
    }).withMessage('Password must be at least 5 chars long')
   .matches(/\d/).withMessage('Password must contain a number').custom((value, {
        req
    }) => {
        if (value !== req.body.passwordConfirmation) {
            throw new Error('Password confirmation is incorrect');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    })
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        data = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            username: req.body.username,
            password: req.body.password
        };

        res.render('register', {
            errors: errors.array(),
            data: data,
            nav: "Home > Users > Register"
        });
    } else {
        let newUser = new User({
            fname: req.body.fname.charAt(0).toUpperCase() + req.body.fname.slice(1),
            lname: req.body.lname.charAt(0).toUpperCase() + req.body.lname.slice(1),
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
            username: req.body.username,
            password: req.body.password,
            since: new Date().toUTCString(),
            lastUpdated: new Date().toUTCString()
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                // Store hash in your password DB.
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        console.log('User Registered!');
                        req.flash('success', 'User Registered!');
                        res.redirect('/users/login');
                        // res.json(newUser);
                    }
                })
            });
        });
    }
})

/*Upload profile image*/
router.post('/profile/image/:id', upload.single('image'), function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: 'bravo2020',
            api_key: '944273769192317',
            api_secret: 'WBX2LcP_kB9tKlMlAZc4E-4uy5w'
        });
        /*console.log(req.file);*/
        if (req.file) {
            var path = req.file.path
            var newFilename = req.params.id;
            /*console.log(newFilename);*/
            cloudinary.uploader.upload(path, {
                public_id: `Store/Profile_Images/${newFilename}`
            }, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    /*console.log(result.url);*/
                    let user = {
                        image: result.url
                    };
                    let query = {
                        _id: req.params.id
                    }
                    User.updateOne(query, user, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('image', result.url);
                            req.flash('success', 'Image Update Successful!');
                            res.redirect('/users/profile/' + req.params.id);
                        }
                    })
                }
            })
        } else {
            req.flash('warning', 'No image selected!');
            res.redirect('/users/profile/' + req.params.id);
        }
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
});
router.get('/profile/security/:id', function (req, res) {
    res.render('security', {
        errors: "",
        data: "",
        nav: "Home > Users > Profile > Password Change > " + req.user._id
    });
})

router.post('/profile/security/:id', urlencodedParser, [

  check('newPassword').isLength({
        min: 5
    }).withMessage('New password must be at least 5 chars long')
   .matches(/\d/).withMessage('New password must contain a number').custom((value, {
        req
    }) => {
        if (value !== req.body.newPasswordConfirmation) {
            throw new Error('Password confirmation is incorrect');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    check('currentPassword').not().isEmpty().withMessage("Enter current password."),
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        let data = {
            password: req.body.newPassword
        }

        res.render('security', {
            errors: errors.array(),
            user: req.user,
            data: data,
            nav: "Home > Users > Profile > Password Change > " + req.user.fname + " " + req.user.lname
        });

    } else {

        let newPass = {
            password: req.body.newPassword,
            lastUpdated: new Date().toUTCString()
        };

        /**/

        bcrypt.compare(req.body.currentPassword, req.user.password, function (err, isMatch) {
            // res === true
            if (isMatch) {
                let query = {
                    _id: req.params.id
                }

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newPass.password, salt, function (err, hash) {
                        if (err) {
                            console.log(err);
                        }
                        // Store hash in your password DB.
                        newPass.password = hash;
                        let query = {
                            _id: req.params.id
                        }

                        User.updateOne(query, newPass, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                console.log(req.params.id);
                                req.flash('success', 'Password change successful!');
                                res.redirect('/users/profile/security/' + req.params.id);
                                // res.json(newPass);
                            }
                        })

                    });
                });
            } else {
                req.flash('danger', 'Wrong password!');
                res.redirect('/users/profile/security/' + req.params.id);
            }
        });
    }
});
router.get('/profile/:id', function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        User.findById(req.params.id, function (error, user) {
            res.render('profile', {
                user: user,
                image: user.image,
                id: user._id,
                errors: "",
                nav: "Home > Users > Profile > " + req.user.fname + " " + req.user.lname
            });
        })
    } else {
        res.status(404).render('404', {
            nav: ""
        });
    }
});

router.post('/profile/:id', urlencodedParser, [
    /*check('username').not().isEmpty().withMessage("Username is required").custom((value, {
    req
}) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) {
                reject(new Error("Server Error"))
            }
            if (Boolean(user)) {
                reject(new Error("Username already in use"))
            }
            resolve(true);
        })
    })
}),*/

  check('fname').not().isEmpty().withMessage("First name is required").isLength({
        min: 3
    }).withMessage('Name must be at least 3 chars long'),
  check('lname').not().isEmpty().withMessage("Last name is required").isLength({
        min: 3
    }).withMessage('Name must be at least 3 chars long'),
  check('email').not().isEmpty().withMessage("Email is required").isEmail().normalizeEmail().withMessage('Email is invalid'),
  check('phone').not().isEmpty().withMessage("Phone number is required").isLength({
        min: 10
    }).withMessage('Invalid phone number'),
  check('username').not().isEmpty().withMessage("Username is required").isLength({
        min: 3
    }).withMessage('Username must be at least 3 chars long'),
    check('password').not().isEmpty().withMessage("Enter your password.")
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        res.render('profile', {
            errors: errors.array(),
            user: req.user,
            nav: "Home > Users > Profile > " + req.user.fname + " " + req.user.lname
        });

    } else {

        let updatedUser = {

            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            lastUpdated: new Date().toUTCString()

        };

        /**/

        bcrypt.compare(req.body.password, req.user.password, function (err, isMatch) {
            // res === true
            if (isMatch) {
                let query = {
                    _id: req.params.id
                }

                User.updateOne(query, updatedUser, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        console.log(req.params.id);
                        req.flash('success', 'Profile Update Successful!');
                        res.redirect('/users/profile/' + req.params.id);
                        // res.json(newUser);
                    }
                });

            } else {
                req.flash('danger', 'Incorrect password!');
                res.redirect('/users/profile/' + req.params.id);
            }
        });

        /*bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
            console.log(err);
        }
        // Store hash in your password DB.
        user.password = hash;
        let query = {
            _id: req.params.id
        }

        User.updateOne(query, user, function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log(req.params.id);
                req.flash('success', 'Profile Update Successful!');
                res.redirect('/users/profile/' + req.params.id);
                // res.json(newUser);
            }
        })

    });
});*/

    }
})

router.delete('/profile/:id', function (req, res) {
    let query = {
        _id: req.params.id
    }

    User.deleteOne(query, function (error) {
        if (error) {
            console.log(error);
        }
        req.flash('danger', 'Account Deleted!');
        res.send('Success');
    })
})

module.exports = router;
