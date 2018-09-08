const crypto = require('crypto');
const mongoose = require('mongoose');
const Partner = require('../models/partnerModel');
const Catalog = require('../models/menuCatalogModel');
const email = require('./../providers/email');
const sms = require('./../providers/sms');
const imgcdn = require('../providers/image_assets');

const catalog = require('./catalogController');

const algorithm = 'aes256'; 
const key = process.env.PASSWORD_KEY;

function encrypt() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
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
    payload.password = password.encrypted;
    payload.location.coordinates = []
    payload.location.coordinates.push(parseFloat(payload.location.longitude));
    payload.location.coordinates.push(parseFloat(payload.location.latitude));
    payload.bankDetails.name = payload.bankDetails.accname;

    if (payload.characteristics) {
        if (payload.characteristics.type === "Quick Service") {
            payload.characteristics.typeid = "1"
        } else if (payload.characteristics.type === "Restaurant") {
            payload.characteristics.typeid = "2"
        } else if (payload.characteristics.type === "Hotel") {
            payload.characteristics.typeid = "3"
        } else {
            payload.characteristics.typeid = "1"
        }
    }

    const partner = new Partner(payload);

    partner.save().then((success) => {
        console.log('Saved Successfully ', success.partnerID)

        // Send Email & SMS Confirmation to the Partner
        email.sendEmail(success.name, success.email, success.partnerID, password.password);
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
        delete partner.password;

        return res.status(200).json({
            status: 200,
            data: partner
        })
    })

}

function updatePartner(req, res, next) {

    const query = { 'partnerID': req.params.partnerID };
    let updatedPartner = req.body;

    // Add point
    updatedPartner.location = {
        type: "Point",
        coordinates: [ parseFloat(updatedPartner.location.longitude), parseFloat(updatedPartner.location.latitude) ]
    };

    delete updatedPartner.partnerID;
    if (req.body.usertype === "partner") {
        // Cannot Update these parameters.
        delete updatedPartner.name;
        delete updatedPartner.phone;
    }
    if (updatedPartner.password) delete updatedPartner.password;

    if (updatedPartner.characteristics) {
        if (updatedPartner.characteristics.type === "Quick Service") {
            updatedPartner.characteristics.typeid = "1"
        } else if (updatedPartner.characteristics.type === "Restaurant") {
            updatedPartner.characteristics.typeid = "2"
        } else if (updatedPartner.characteristics.type === "Hotel") {
            updatedPartner.characteristics.typeid = "3"
        } else {
            updatedPartner.characteristics.typeid = "1"
        }
    }

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
                    active: partner.isActive,
                    pending: partner.isPending
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

function getActivePartners(req, res, next) {
    const password = encrypt();
    console.log(password);
}

function getPendingPartners() {}

function updatePartnerStatus(req, res, next) {
    const query = { 'partnerID': req.body.partnerID };
    const status = req.body.status;
    let update = { isActive: true, isPending: false };
    // Check Status & PartnerID
    if (typeof status !== "boolean" && typeof req.body.partnerID !== "number") {
        return res.end(500);
    }

    if (status === false) {
        update = {
            isActive: false,
            isPending: true
        }
    }

    Partner.findOneAndUpdate(query, update, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 500, message: 'Error Updating Partner' })
        }
        return res.status(200).json({
            status: 200,
            message: 'Partner updated successfully'
        })

    })
}

function uploadImage(req, res, next) {

    let file = req.files.file;

    imgcdn.uploadImage(file, "logo").then((success) => {
        res.json({
            success: success.public_id
        })
    }).catch((err) => {
        console.log(`Error while uploading image: ${err}`);
        res.json({
            error: 'Error uploading image. Try again later.'
        })
    })
}

function uploadBGImage(req, res, next) {

    let file = req.files.file;

    imgcdn.uploadImage(file, "bg").then((success) => {
        res.json({
            success: success.public_id
        })
    }).catch((err) => {
        console.log(`Error while uploading image: ${err}`);
        res.json({
            error: 'Error uploading image. Try again later.'
        })
    })
}

function saveMenu(req, res, next) {
    
    const query = { 'partnerID': req.params.partnerID || req.body.partnerID };
    const menu = req.body.menu;
    const type = req.body.type;

    try {
        Partner.findOne(query, (err, partner) => {
            if(err) {
                throw 'error';
            }
    
            partner.menu = menu;

            if (type === 'draft') {
                partner.isPending = false;
            } else if (type === 'publish') {
                partner.isPending = true;
            } else {
                throw 'error';
            }

            partner.save((err) => {
                if (err) throw 'error';
                
                if (type === 'publish') {
                    // Notify admin of menu update for review.
                    email.sendMenuUpdateNotification(partner.name, partner.partnerID);
                }

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

const getCollections = async(req, res, next) => {
    
    const partnerID = parseInt(req.params.partnerID);
    const query = { partnerID: partnerID };
    
    try {
        let collections = await Partner.findOne(query, 'menu').exec();

        if (!collections) {
            throw new Error(collections);
        }

        console.log(`Collections Fetched ${partnerID} - ${collections}`);

        return res.status(200).json({
            status: 200,
            message: 'Collections fetched successfully',
            collections: collections.menu
        })

    } catch(err) {
        console.log(`Error fetching collections ${partnerID} - ${err}`);
        return res.status(500).json({
            status: 500,
            message: 'No collections found'
        });
    }
}

const saveCollections = async(req, res, next) => {
    const partnerID = parseInt(req.params.partnerID);
    const query = { partnerID: partnerID };
    const collections = req.body.collections;

    try {
        let partner = await Partner.findOneAndUpdate(query, { $set: { menu: collections }}).exec();

        if (!partner) {
            throw new Error(partner);
        }

        return res.status(200).json({
            status: 200,
            message: "Collection updated successfully"
        });
        
    } catch(err) {
        console.log(`Error updating Collection ${partnerID}`);
        return res.status(500).json({
            status: 500,
            message: "Error updating collection"
        });
    }
}

const saveItem = async(req, res, next) => {

    const partnerID = parseInt(req.params.partnerID);

    try {
        let catalogItem = await catalog.saveItem(partnerID, req.body.item);

        if (catalogItem) {            
            
            return res.status(200).json({
                status: 200,
                message: 'Menu Item saved successfully',
                item: catalogItem
            })

        }
    } catch(err) {

        console.log(`Error saving Item ${partnerID} - ${JSON.stringify(err)}`);

        return res.status(500).json({
            status: 500,
            message: 'Error saving Menu Item'
        })

    }

    

}

const getItems = async(req, res, next) => {

    try {

        const partnerID = parseInt(req.params.partnerID);
        const query = { partnerID: partnerID };

        let items = await Catalog.find(query).exec();

        if (items) {
            return res.status(200).json({
                status: 200,
                message: "Request processed successfully",
                total: items.length,
                items: items
            });
        }
    } catch(err) {
        console.log(`Fetch Error ${partnerID} - ${err}`);
        return res.status(500).json({
            status: 500,
            message: "No records found"
        })
    }

}

const deleteItem = async(req, res, next) => {
    try {

        const query = {
            partnerID: parseInt(req.params.partnerID),
            id: parseInt(req.params.id)
        }

        const status = await Catalog.remove(query);

        if (status.n == 0) {
            throw new Error (status);
        } else {
            return res.status(200).json({
                status: 200,
                message: 'Item deleted successfully'
            });
        }

    } catch(err) {
        console.log(`Error deleting item: ${err}`);

        return res.status(500).json({
            status: 500,
            message: 'Error deleting Item'
        })
    }
}

function getMenu(req, res, next) {
    const query = { partnerID: req.params.partnerID || req.body.partnerID };
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
    updatePartnerStatus,
    uploadImage,
    uploadBGImage,
    saveMenu,
    getCollections,
    saveCollections,
    saveItem,
    getItems,
    deleteItem,
    getMenu
};