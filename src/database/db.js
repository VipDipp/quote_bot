const mongoose = require('mongoose');
const url = require('../../config').mongoApi;

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