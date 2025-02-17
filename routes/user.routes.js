const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//  for viewing type /user/test    only for testing 
// router.get('/test', (req, res) => {
//     res.send('user test route')
// })

// router.get('/register', (req, res) => {
//     res.render('register');
// });


router.post('/register',
    body('email').trim().isEmail().isLength({ min: 10}),
    body('password').trim().isLength({ min: 5}),
    body('username').trim().isLength({ min: 3}),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            })
        }

        const { email, username, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            email,
            username,
            password: hashPassword
        })

        res.redirect('/user/login')
})


router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login',
    body('username').trim().isLength({ min: 3}),
    body('password').trim().isLength({ min: 5}),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array(),
                message: 'Invalid data'
            })
        }

        const { username, password } = req.body;

        const user = await userModel.findOne({
            username: username
        })

        if(!user){
            return res.status(400).json({
                message: 'username or password is incorrect'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({
                message: 'username or password is incorrect'
            })
        }

        // and now install JsonWebToken

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        },
            process.env.JWT_SECRET,
        )

        res.cookie('token', token)

        res.redirect('/home')

        // now install cookie-parser pkg
    }
)

router.get('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');

    // Redirect to the login page
    res.redirect('/user/login');
});


module.exports = router;