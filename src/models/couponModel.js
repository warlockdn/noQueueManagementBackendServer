const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');

// Initialize Auto Increment 
const connection = mongoose.createConnection(process.env.MONGO_CONNECT_URL);

const couponSchema = new Schema({
    id: { type: Number, unique: true, required: true },
    discountCode: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    comments: { type: String },
    isActive: { type: Boolean },
    discountOptions: {
        type: { type: String, required: true }, // Fixed or Percentage
        value: { type: Number, required: true }
    },
    discountFrom: {
        partnerID: { type: Number },
        name: { type: String },
        // type: { type: String, index: true }
    },
    minimumAmount: { type: Number },
    usageLimits: {
        isTotalLimit: { type: Boolean, default: false },
        totalLimit: { type: Number },
        limitOne: { type: Boolean }
    },
    validity: {
        startDate: { type: Date, default: Date.now },
        startTime: { type: String },
        endDate: { type: Date },
        endTime: { type: String }
    },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
})

couponSchema.pre("update", (next) => {
    this.updatedOn = Date.now();
    next();
})

couponSchema.plugin(autoIncrement, {
    model: 'Coupons',
    field: 'id',
    startAt: 20000,
    incrementBy: 2
});

const Coupons = connection.model('Coupons', couponSchema);

module.exports = Coupons;