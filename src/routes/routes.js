const express = require('express');
const partnerRoutes = require('./partner');
const authRoutes = require('./auth');
const coupon = require('../controllers/couponsController');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/partner', partnerRoutes);

router.route('/coupon')
    .get(coupon.getCoupons)
    .post(coupon.createCoupon)
    .put(coupon.updateCoupon)
    .patch(coupon.toggleisActive)

router.route('/coupon/:couponID')
    .delete(coupon.deleteCoupon)

module.exports = router;


