const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    chatID: {
        type: Number,
        required: true,
        unique: true
    },
    path: {
        type: String,
        default: 'main'
    }
})

const AlertsSchema = new Schema({
    chatID: {
        type: Number,
        required: true,
        unique: true
    },
    alert: {
        type: Array,
        default: []
    },
    value: {
        type: Array,
        default: []
    },
    higher: {
        type: Array,
        default: []
    }
})

const User = model('User', UserSchema);
const Alerts = model('Alerts', AlertsSchema);


module.exports = {
    User,
    Alerts
}