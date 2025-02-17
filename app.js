const express = require('express');
const userRouter = require('./routes/user.routes')
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require('./config/db')
connectToDB();
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index.routes');

const app = express();

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/', indexRouter)
app.use('/user', userRouter)


const path = require('path');

app.set('views', path.resolve('./views'));  // Correct path to views folder
app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    res.render('register');
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

