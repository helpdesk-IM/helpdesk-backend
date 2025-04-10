const express = require('express')
const router = express.Router()
const {getUsers, createUsers, getUsersById, updateEmail} = require('../controller/user.controller.js')
const {verifyUser, verifyAdmin} = require('../auth/verifyToken.js')

router.get('/users', getUsers)
router.get('/users/:id',verifyUser, getUsersById)
router.post('/users', createUsers)
router.put('/user-email/:id',verifyUser, updateEmail)

module.exports = router