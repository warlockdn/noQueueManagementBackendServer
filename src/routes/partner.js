const express = require('express');
const router = express.Router();
const partner = require('./../controllers/partnerController');

router.route('/')
    .post(partner.createPartner)
    .get(partner.getAllPartners)
    
router.route('/:partnerID')
    .get(partner.getPartner)
    .post(partner.updatePartner)
    .delete(partner.deletePartner)

router.route('/uploadimage')
    .post(partner.uploadImage)

module.exports = router;