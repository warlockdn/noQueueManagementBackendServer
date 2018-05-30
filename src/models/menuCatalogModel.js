const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc')

// Initialize Auto Increment 
const connection = mongoose.createConnection(process.env.MONGO_CONNECT_URL);

const addonItemSchema = new Schema({
    name: { type: String, required: true },
    isNonVeg: { type: Boolean, default: false },
    price: { type: Number, required: true, default: 0 },
    inStock: { type: Boolean, default: true }
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
});

const addonGroupSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    choices: [ addonItemSchema ]
    // add Min, Max later.
})

const catalogSchema = new Schema({  
    id: { type: Number, unique: true, required: true },
    partnerID: { type: Number, index: true, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    isNonVeg: { type: Boolean, default: false },
    description: { type: String },
    hasAddons: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    addons: [ addonGroupSchema ],
    createdOn: { type: Date, default: Date.now() },
    updatedOn: { type: Date, default: Date.now() }
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
});

catalogSchema.pre('update', (next, done) => {
    this.updatedOn = Date.now();
    next();
});

/* catalogSchema.pre('save', (next, done) => {
    this.createdOn = Date.now();
    this.updatedOn = Date.now();
    next();
}); */

catalogSchema.options.toJSON = {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
}

catalogSchema.plugin(autoIncrement, {
    model: 'Catalog',
    field: 'id',
    startAt: 10000,
    incrementBy: 1
});

const Catalog = connection.model('Catalog', catalogSchema);

module.exports = Catalog;