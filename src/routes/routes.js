const express = require('express');
const partnerRoutes = require('./partner');
const authRoutes = require('./auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/partner', partnerRoutes);

module.exports = router;


