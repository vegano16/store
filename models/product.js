let mongoose = require('mongoose');

let productSchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: false
    },
    from: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false
    },
    size: {
        type: String,
        required: false
    },
    quality: {
        type: String,
        required: false
    },
    keywords: {
        type: String,
        required: Array
    },
    country: {
        type: String,
        required: false
    },
    districts: {
        type: Array,
        required: false
    },
    productId: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    gallery: {
        type: Array,
        required: false
    },
    date: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: String,
        required: true
    },
    by: {
        type: String,
        required: false
    },
    approved: {
        type: Boolean,
        required: true
    },
    approved_by: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Product', productSchema);
