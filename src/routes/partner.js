const express = require('express');
const router = express.Router();
const partner = require('./../controllers/partnerController');

// Routes For Admin
router.route('/')
    .post(partner.createPartner)
    .get(partner.getAllPartners);

// Routes for Partner
router.route('/uploadimage')
    .post(partner.uploadImage);

router.route('/updateStatus')
    .all((req, res, next) => {
        checkBoss(req, res, next)
    })
    .post(partner.updatePartnerStatus);

router.route('/menu')
    .all((req, res, next) => {
        checkPartner(req, res, next);
    })
    .get(partner.getMenu)
    .post(partner.saveMenu);
    
router.route('/:partnerID')
    .all((req, res, next) => {
        checkBoss(req, res, next);
    })
    .get(partner.getPartner)
    .post(partner.updatePartner)
    .delete(partner.deletePartner);

router.route('/:partnerID/menu')
    .all((req, res, next) => {
        checkBoss(req, res, next);
    })
    .get(partner.getMenu)
    .post(partner.saveMenu);

// router.route('/:partnerID/menuv2')
router.route('/:partnerID/menuv2/collections')
    .get(partner.getCollections)
    .post(partner.getCollections)

router.route('/:partnerID/menuv2/items')
    .post(partner.saveItem)
    .get(partner.getItems)
    
router.route('/:partnerID/menuv2/items/delete/:id')
    .delete(partner.deleteItem);

const checkBoss = (req, res, next) => {
    if (req.body.usertype !== 'boss') {
        res.status(401).json({
            statuscode: 401,
            message: 'User Unauthorized'
        })
    } else {
        next();
    }
}

const checkPartner = (req, res, next) => {
    if (req.body.usertype !== 'partner') {
        res.status(401).json({
            statuscode: 401,
            message: 'User Unauthorized'
        })
    } else {
        next();
    }
}

module.exports = router;