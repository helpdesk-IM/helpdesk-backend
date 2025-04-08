const express = require('express');
const loginUser  = require('../auth/login');
const router = express.Router();

router.post('/login', loginUser);
module.exports = router;
