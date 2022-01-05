const { Schema, model } = require('mongoose');

const User = new Schema({
    chatID: {
        type: Number,
        required: true,
        unique: true
    },
    alerts: {
        type: Number
    }
})

module.exports = model('User', User);