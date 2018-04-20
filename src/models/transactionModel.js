const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-plugin-autoinc');

// Initialize Auto Increment 
const connection = mongoose.createConnection("mongodb://localhost:27017/food");

const transactionSchema = new Schema({
    transactionID: { type: Number, index: true, unique: true, required: true, default: 10000000000 },
    orderID: { type: Number, index: true, unique: true, required: true, default: 100000 },
    createdTimestamp: Date,
    summary: [],
    customer: {
        customerID: Number,
        customerName: String,
    },
    partner: {
        id: Number,
        name: String,
    },
    payment: {
        paymentMode: String,
        modeID: Number, // 100 (Wallet), 200 (Card), 300 (Online), 400 (Points), 500 (Points & Others)
        source: String,
        statusText: String // { Pending, Completed }
    },
    status: Boolean,
    total: Number,
    tax: Number,
    percent: Number,
    commission: Number,
    createdOn: Date,
    updatedOn: Date,
});

transactionSchema.plugin(autoIncrement.plugin, {
    model: 'Transaction',
    field: 'transactionID', 
    startAt: 10000000000,
    incrementBy: 7
});

transactionSchema.plugin(autoIncrement.plugin, {
    model: 'Transaction',
    field: 'orderID', 
    startAt: 100000,
    incrementBy: 7
});

transactionSchema.pre('update', function (next, done) {
    this.updatedOn = Date.now();
    next();
});

transactionSchema.pre('save', function (next, done) {
    this.createdOn = Date.now();
    next();
});

const Transaction = connection.model('Transaction', transactionSchema);

module.exports = Transaction;