const { Schema, model } = require('mongoose');

const User = new Schema({
    chatID: {
        type: Number,
        required: true,
        unique: true
    },
    path: {
        type: String,
        default: 'main'
    },
    alerts: {
        type: Number,
        default: 0
    }
})

const Alerts = new Schema({
    chatID: {
        type: Number,
        required: true,
        unique: true
    },
    alert: {
        type: Array
    }

})




module.exports = model('User', User);