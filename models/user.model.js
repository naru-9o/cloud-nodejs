const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unquie: true,
        minlength: [3, 'Username must be at least 3 character long']
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unquie: true,
        minlength: [10, 'email must be at least 10 character long']
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, 'password must be 5 character long']
    }
})

const user = mongoose.model('user', userSchema)

module.exports = user;