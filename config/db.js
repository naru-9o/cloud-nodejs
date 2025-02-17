const mongoose = require('mongoose');

function conectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('connected db')
    })
}

module.exports = conectToDB;