const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGO;

const start = async() => {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to server');
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    start
}