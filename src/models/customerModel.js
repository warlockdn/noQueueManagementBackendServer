const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-plugin-autoinc');

// Initialize Auto Increment 
const connection = mongoose.createConnection(process.env.MONGO_CONNECT_URL);

const customerSchema = new Schema({
    customerID: { type: Number, index: true, unique: true, required: true, default: 1000000 },
    phone: { type: Number, index: true, unique: true, required: true },
    password: { type: String, required: true },
    hash: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true },
    city: { type: String, lowercase: true },
    about: String,
    shareCode: { type: String, lowercase: true },
    isActive: { type: Boolean, default: false },
    createdOn: Date,
    updatedOn: Date,
    extras: {
        lastOrder: Number,
        totalSpend: Number
    }
});

customerSchema.plugin(autoIncrement.plugin, {
    model: 'Customers',
    field: 'customerID',
    startAt: 1000000,
    incrementBy: 3
});

customerSchema.pre('update', function (next, done) {
    this.updatedOn = Date.now();
    next();
});

customerSchema.pre('save', function (next, done) {
    this.createdOn = Date.now();
    next();
});

const Transaction = connection.model('Transaction', customerSchema);

module.exports = Transaction;