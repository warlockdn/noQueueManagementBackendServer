const crypto = require('crypto');
const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc')

// Initialize Auto Increment 
const connection = mongoose.createConnection(process.env.MONGO_CONNECT_URL);

const subCollectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'subcategory' },
    items: [{
        id: { type: Number, required: true }
    }]
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
})

const collectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'category' }, // Recommended, Popular & Category
    items: [{
        id: { type: Number }
    }],
    subcollection: [ subCollectionSchema ]
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
});

const partnerSchema = new mongoose.Schema({
    partnerID: { type: Number, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, index: true, unique: true, required: true, trim: true, lowercase: true, },
    phone: { type: Number, index: true, unique: true, required: true },
    password: String,
    imageid: String,
    partnerbg: String,
    phoneAlternate: { type: String },
    basic: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true } 
    },
    menu: [ collectionSchema ],
    location: {
        type: { type: String, default: "Point"},
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
            type: String
        },
        services: [String],
        seating: { type: Boolean, default: false },
        cuisine: [String],
        weektiming: [String],
        opentime: { type: String, required: true },
        closetime: { type: String, required: true },
    },
    taxInfo: {
        cgst: { type: Number },
        sgst: { type: Number },
        servicetax: { type: Number }
    },
    bankDetails: {
        accname: { type: String, required: true },
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
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.password;
        }
    }
});

partnerSchema.methods.validatePassword = (password, receivedPassword) => {
    const key = process.env.PASSWORD_KEY;
    let decipher = crypto.createDecipher('aes256', key);
    let decrypted = decipher.update(password, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    console.log(decrypted);

    if (decrypted === receivedPassword) return true;
    return false;
}

partnerSchema.pre('update', (next) => {
    this.updatedOn = Date.now();
    next();
});

partnerSchema.pre('save', (next) => {
    this.createdOn = Date.now();
    next();
});

partnerSchema.plugin(autoIncrement, {
    model: 'Partner',
    field: 'partnerID',
    startAt: 100300,
    incrementBy: 3
});

partnerSchema.index({ location: "2dsphere" });

const Partner = connection.model('Partner', partnerSchema);

module.exports = Partner;