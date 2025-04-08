const express = require('express')
const router = express.Router()
const {verifyAdmin, verifyUser} = require('../auth/verifyToken')

const {resetPassword} = require('../controller/passwords.controller')

router.put('/reset-password/:id',verifyUser, resetPassword)

module.exports = router