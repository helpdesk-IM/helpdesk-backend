const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors({
    origin : "http://localhost:4300", 
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
   }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// 
require('dotenv').config()
const userRoutes = require('./src/router/user.router.js')
const productRoute = require('./src/router/product.router.js')
const loginRoute = require('./src/router/login.router.js')
const ticketRoute = require('./src/router/tickets.router.js')
const passswordRoute = require('./src/router/password.router.js')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

// mongoose.connect.
mongoose.connect(process.env.DB_URL)
    .then(() => console.log("Mongo DB Connected"))
    .catch(() => console.log('error in connecting mongo bd'))

//index route
app.get('/', async (req, res) => {
    return res.send("I am working")
})

app.use(cookieParser())



app.use('/api/v1', userRoutes)
app.use('/api/v1', productRoute)
app.use('/api/v1', loginRoute)
app.use('/api/v1/', ticketRoute)
app.use('/api/v1/', passswordRoute)


app.listen(process.env.PORT, () => console.log(`the server is running on port ${process.env.PORT}`))

