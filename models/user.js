let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    since: {
        type: String,
        required: true
    },
    accessLevel: {
        type: String,
        default: 'client'
    },
    image: {
        type: String,
        default: '-'
    },
    purchases: {
        type: Array,
        required: false
    },
    messages: {
        type: Array,
        required: false
    },
    Ads: {
        type: Array,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    lastUpdated: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema);
