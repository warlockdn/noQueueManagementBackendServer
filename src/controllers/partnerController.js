const crypto = require('crypto');
const mongoose = require('mongoose');
const Partner = require('../models/partnerModel');
const email = require('./../providers/email');
const sms = require('./../providers/sms');
const imgcdn = require('../providers/image_assets');

const algorithm = 'aes256'; 
const key = process.env.PASSWORD_KEY;

function encrypt() {
    const chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    let pw = "";
    
    for (var x = 0; x < 8; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pw += chars.charAt(i);
    }

    const cipher = crypto.createCipher(algorithm, key);  
    const encrypted = cipher.update(pw, 'utf8', 'hex') + cipher.final('hex');
    console.log("ENCRYPTED: " + encrypted);
    return { 
        "encrypted": encrypted,
        "password": pw
    };
}

function createPartner(req, res, next) {

    console.log('Creating Partner');

    const password = encrypt();

    let payload = req.body;
    
    // Setting initial Values..
    payload.isActive = false;
    payload.isPending = true;
    payload.location.coordinates = []
    payload.location.coordinates.push(parseFloat(payload.location.longitude));
    payload.location.coordinates.push(parseFloat(payload.location.latitude));
    payload.bankDetails.name = payload.bankDetails.accname;

    const partner = new Partner(payload);

    partner.save().then((success) => {
        console.log('Saved Successfully ', success.partnerID)

        // Send Email & SMS Confirmation to the Partner
        email.sendEmail(success.email, success.partnerID, password.password);
        sms.send(success.phone, success.name, success.partnerID, password.password);

        res.status(200).json({
            status: 200,
            message: "Saved Successfully",
            partnerID: success.partnerID,
            password: password.password
        })
        
    }).catch((e) => {
        console.error('Error Saving', e)
        res.status(500).json({
            status: 500,
            message: "Error Saving Partner"
        })
    })

}

function getPartner(req, res, next) {

    const query = { partnerID: req.params.partnerID };
    Partner.findOne(query, (err, partner) => {
        if (err) {
            return res.status(500).json({ status: 500, message: 'No results found' })
        }

        // Removing Menu
        partner.menu = [];

        return res.status(200).json({
            status: 200,
            data: partner
        })
    })

}

function updatePartner(req, res, next) {

    const query = { 'partnerID': req.params.partnerID };
    const updatedPartner = req.body;

    Partner.findOneAndUpdate(query, updatedPartner, { upsert: false }, (err, result) => {
        if (err) {
            let message = null;
            if(err.code === 11000) { message = 'Email or Phone number already exists'; }
            return res.status(500).json({ status: 500, message: message || 'Error Updating Partner' })
        }

        return res.status(200).json({
            status: 200,
            message: 'Partner updated successfully'
        })

    })

}

function deletePartner(partnerID) {}

function getAllPartners(req, res, next) {
    Partner.find({}, (err, results) => {
        if(!err) {

            let partners = [];

            results.map((partner) => {
                partners.push({
                    partnerID: partner.partnerID,
                    name: partner.name,
                    city: partner.basic.city,
                    state: partner.basic.state,
                    pincode: partner.basic.pincode,
                    active: partner.isActive
                })
            })

            res.json({
                data: partners,
                statusCode: 200,
                message: 'Success'
            });

        } else {
            
            res.status(500).json({
                data: partners,
                statusCode: 200,
                message: 'Success'
            });

        }
    })
}

function getActivePartners() {}

function getPendingPartners() {}

function uploadImage(req, res, next) {

    let files = req.files;

    imgcdn.uploadImage(files.image).then((success) => {
        console.log(success);
        res.json({
            success: success
        })
    }).catch((err) => {
        console.log(err);
        res.json({
            error: err
        })
    })
}

function saveMenu(req, res, next) {
    
    const query = { 'partnerID': req.params.partnerID };
    const menu = req.body.menu;
    const type = req.body.type;

    try {
        Partner.findOne(query, (err, partner) => {
            if(err) {
                throw 'error';
            }
    
            partner.menu = menu;

            if (type === 'draft') {
                partner.isPending = true;
            } else if (type === 'publish') {
                partner.isPending = false;
            } else {
                throw 'error';
            }

            partner.save((err) => {
                if (err) throw 'error';
                
                return res.status(200).json({
                    status: 200,
                    message: 'Partner menu updated successfully'
                });
            })
    
        })
    } 
    
    catch(err) {
        return res.status(500).json({
            status: 500,
            message: 'Error updating Partner menu'
        })
    }

}

function getMenu(req, res, next) {
    const query = { partnerID: req.params.partnerID };
    Partner.findOne(query, (err, partner) => {
        if (err) {
            return res.status(500).json({ status: 500, message: 'No results found' })
        }

        const menu = partner.menu;

        return res.status(200).json({
            status: 200,
            data: menu
        })
    })
}

module.exports = { 
    createPartner, 
    getPartner, 
    updatePartner, 
    deletePartner, 
    getAllPartners, 
    getActivePartners, 
    getPendingPartners, 
    uploadImage,
    saveMenu,
    getMenu
};