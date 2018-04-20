const crypto = require('crypto');
const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc')

// Initialize Auto Increment 
const connection = mongoose.createConnection("mongodb://localhost:27017/food");

const partnerSchema = new mongoose.Schema({
    partnerID: { type: Number, index: true, unique: true },
    name: { type: String, required: true },
    // email: { type: String, index: true, unique: true, required: true, trim: true, lowercase: true, },
    email: { type: String, index: true, unique: true, required: true, trim: true, lowercase: true, },
    phone: { type: Number, index: true, unique: true, required: true },
    password: String,
    imageid: String,
    phoneAlternate: { type: String },
    basic: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true } 
    },
    menu: [],
    location: {
        coordinates: {
            type: [Number],
            index: '2d',
            required: true
        },
        elevation: Number
    },
    characteristics: {
        "type": { type: String, required: true },
        typeid: { 
            /*  1 - QSR, 2 - Restaurant, 3 - Hotels  */
            type: String,
            required: true
        },
        services: [String],
        seating: { type: Boolean, default: false },
        cuisine: [String],
        weektiming: [String],
        opentime: { type: Date, required: true },
        closetime: { type: Date, required: true },
    },
    bankDetails: {
        name: { type: String, required: true },
        number: { type: Number, required: true },
        bankname: { type: String, required: true },
        branch: { type: String, required: true },
        ifsc: { type: String, required: true },
    },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
    isActive: {
        type: Boolean,
        default: false
    },
    isPending: {
        type: Boolean,
        default: true
    },
    commission: { type: Number, default: 8 },
    documents: []
});

partnerSchema.methods.validatePassword = (password) => {
    var decipher = crypto.createDecipher('aes256', password)
    var dec = decipher.update(password, 'hex', 'utf8')
    dec += decipher.final('utf8');

    console.log(dec);

    return dec
}

partnerSchema.pre('update', function (next, done) {
    this.updatedOn = Date.now();
    next();
});

partnerSchema.pre('save', function (next, done) {
    this.createdOn = Date.now();
    next();
});

partnerSchema.plugin(autoIncrement, {
    model: 'Partner',
    field: 'partnerID',
    startAt: 100300,
    incrementBy: 3
});

const Partner = connection.model('Partner', partnerSchema);

module.exports = Partner;