const mongoose = require('mongoose');
const Partner = require('../models/partnerModel');
const Catalog = require('../models/menuCatalogModel');

const saveCollections = async(partnerID, collections) => {

    const query = { partnerID: partnerID };

    try {    
        let response = await Partner.findOneAndUpdate(query, collections).exec();
        if (response) {
            console.log('Partner Collections Updated');
        }
    } catch(err) {
        console.log(err);
    }
    
};

/* 
    Save Item one by one. Better way.
    Coz we will be updating the the availability later.
*/

const saveItem = async(partnerID, item) => {

    // Now to determine if this is a new item or a existing item.

    if (item.id === undefined) { // New item

        const catalogItem = new Catalog(item);

        try {
            
            let result = await catalogItem.save();
            if (result) {
                return result;
            }

        } catch(err) {
            console.log(`Error saving ${item} \n\n ${err}`);
            return Promise.reject(err);
        }

    } else { // Existing Item

        try {
            
            let result = await Catalog.findOneAndUpdate({
                id: item.id
            }, item, { new: true });

            if (!result) {
                throw new Error(result);
            } else {
                return result;
            }

        } catch(err) {
            return err;
        }

    }

};

const deteleItem = async(partnerID, id) => {

    try {

        let response = await Catalog.findOneAndRemove({ id: id, partnerID: partnerID });

        if (!response) {
            throw new Error(response);
        } else {
            return 'success';
        }

    } catch(err) {
        console.log(`Error removing ${id} for ${partnerID}: ${err}`)
        return 'error';
    }

}

module.exports = {
    saveCollections, 
    saveItem
}