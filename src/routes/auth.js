const express = require('express');
const router = express.Router();
const auth = require('./../controllers/auth');

router.route('/login')
    //.get(auth)
    .post(auth.authenticate);

router.route('/logout')
    .post(auth.logout);

module.exports = router;