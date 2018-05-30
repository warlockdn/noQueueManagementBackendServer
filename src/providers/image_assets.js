const resolve = require('url');
const fs = require('fs');
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'ddiiq3bzl',
    api_key: 377496294925621,
    api_secret: 'EdNfYsT6Orqi1F6pwsaxvNOI2G4'
});


const uploadImage = (image) => {

    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.unsigned_upload_stream('spazefood', 
        { folder: "logo", upload_preset: 'spazefood' }, 
        function(error, success) {
            if (success) {
                console.log('Success: ', success)
                resolve(success)
            } else {
                console.log(error)
                reject(error)
            }
        }).end(image.data)
    })

}

module.exports = { uploadImage }