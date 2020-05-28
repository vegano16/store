const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const {
    check,
    validationResult
} = require('express-validator');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;

//Require and configure DOTENV
require('dotenv').config();


/*MongoClient.connect(
    "mongodb://" + config.mongo.user + ":" + encodeURIComponent(mongoPassword) + "@" +
    config.mongo.hostString,
    function (err, db) {
        if (!err) {
            res.end("We are connected to MongoDB");
        } else {
            res.end("Error while connecting to MongoDB");
        }
    }
);*/
mongoose.connect(process.env.MY_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = mongoose.connection;
db.once('open', function () {
    console.log('Connection Established...');
})
db.on('error', function (err) {
    console.log(err);
})
/*Multer Settings*/
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

//Initialize server(App)
const app = express()

let Product = require('./models/product');

app.set('view engine', 'ejs')

// create application/json parser
let jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({
    extended: false
})

// app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
// app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))
app.use(flash());
//Express-messages
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Bringing in passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
})

// app.get('*', function(req, res, next){
//   res.locals.user = req.user || null;
//   next();
// })
app.get('/', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) {
            console.log(err);
        } else {
            /*console.log(products);*/
            res.render('index', {
                nav: "Home",
                products: products
            })
            // res.render('index', {user: user})
        }
    })
})

let admin = require('./routes/admin');
let users = require('./routes/users');
let products = require('./routes/products');
app.use('/admin', admin);
app.use('/users', users);
app.use('/products', products);


app.use(function (req, res, ) {
    res.status(404).render('404', {
        nav: ""
    });
})

/*app.use(function (error, req, res, next) {
    res.status(500).render('500', {
        error: error,
        nav: "",
        message: "500: Internal Server Error"
    });
})*/

app.listen(process.env.PORT, function (req, res) {
    console.log(`Server running on port ${process.env.PORT}`);
})
