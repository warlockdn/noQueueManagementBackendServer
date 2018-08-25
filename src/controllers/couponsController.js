const logger = require('../logger');
const mongoose = require('mongoose');
const Coupons = require('../models/couponModel');

const getCoupons = async(req, res, next) => {

    try {

        const coupons = await Coupons.find().sort([['updatedOn', 'descending']]).exec();

        if (!coupons) {
            throw new Error(coupons);
        }

        let couponData = [];

        coupons.forEach(coupon => {

            coupon = JSON.parse(JSON.stringify(coupon));

            let newCoupon = {
                id: coupon.id,
                discountCode: coupon.discountCode,
                description: coupon.description,
                comments: coupon.comments,
                isActive: coupon.isActive,
                discountOptions: {
                    type: coupon.discountOptions.type,
                    value: coupon.discountOptions.value,
                    validFor: "global"
                },
                minRequirement: {
                    minvalue: coupon.minimumAmount
                },
                limits: {
                    isTotalLimit: coupon.usageLimits.isTotalLimit || null,
                    totalLimit: coupon.usageLimits.totalLimit,
                    limitOne: coupon.usageLimits.limitOne || false
                },
                duration: {
                    startDate: coupon.validity.startDate,
                    startTime: `${new Date(coupon.validity.startTime).getHours()}:${new Date(coupon.validity.startTime).getMinutes()}`,
                    endDate: coupon.validity.endDate,
                    endTime: `${new Date(coupon.validity.endTime).getHours()}:${new Date(coupon.validity.endTime).getMinutes()}`
                }
            }

            if (coupon.minimumAmount) {
                newCoupon.minRequirement.minimum = "minimum";
            } else {
                newCoupon.minRequirement.minimum = "none";
                delete newCoupon.minRequirement.minvalue;
            }

            // If not global then set the actual partner data
            if (coupon.discountFrom) {
                newCoupon.discountOptions.validFor = coupon.discountFrom;
            }

            // if (coupon.usageLimits.limitOne) {
            //     newCoupon.limits.limitOne = coupon.usageLimits.limitOne;
            // } 

            couponData.push(newCoupon);

        });

        return res.status(200).json({
            code: 200,
            message: "Coupons successfully retreived",
            coupons: couponData
        })

    } catch(err) {

        res.status(500).json({
            code: 500,
            status: "Error"
        })

    }
    
}

const createCoupon = async(req, res, next) => {
    
    let coupon = req.body.coupon;
    let partnerID = null;
    
    try {

        // logger.info("createCoupons(): Creating Coupon " + coupon);
    
        let payload = {
            discountCode: coupon.discountCode,
            description: coupon.description,
            comments: coupon.comments,
            discountOptions: coupon.discountOptions,
            usageLimits: coupon.limits,
            validity: coupon.duration
        };

        // Convert Time to Date, so 12:00 is converted Date, 12, 00;
        payload.validity.startTime = new Date(new Date(coupon.duration.startDate).setHours(coupon.duration.startTime.split(":")[0], coupon.duration.startTime.split(":")[1], 00));
        payload.validity.endTime = new Date(new Date(coupon.duration.endDate).setHours(coupon.duration.endTime.split(":")[0], coupon.duration.endTime.split(":")[1], 00));

        if (coupon.discountOptions) {
            payload.discountOptions = {
                type: coupon.discountOptions.type,
                value: coupon.discountOptions.value
            }
        }
    
        if (coupon.discountOptions.validFor !== "global") {
            payload.discountFrom = coupon.discountOptions.validFor;
            partnerID = coupon.discountOptions.validFor.partnerID;
        }

        if (coupon.minRequirement.minvalue) {
            payload.minimumAmount = coupon.minRequirement.minvalue;
        }
            
        let newCoupon = await (new Coupons(payload)).save();
    
        if (!newCoupon) {
            throw new Error(newCoupon);
        }
        
        // logger.info("createCoupons(): Coupon created successfully " + newCoupon);

        return res.status(200).json({
            code: 200,
            message: "Coupon created successfully",
            coupon: newCoupon
        })

    } catch(err) {

        // logger.info("createCoupons(): Error creating coupon " + err);

        return res.status(500).json({
            code: 500,
            message: "Error creating coupon"
        });
        
    }
    

}

const updateCoupon = async(req, res, next) => {

    const id = req.body.id;
    let coupon = req.body.coupon;

    try {
    
        // logger.info("createCoupons(): Creating Coupon " + coupon);
    
        let updatedCoupon = {
            discountCode: coupon.discountCode,
            description: coupon.description,
            comments: coupon.comments,
            discountOptions: coupon.discountOptions,
            usageLimits: coupon.limits,
            validity: coupon.duration
        };

        // Convert Time to Date, so 12:00 is converted Date, 12, 00;
        payload.validity.startTime = new Date(new Date(coupon.duration.startDate).setHours(coupon.duration.startTime.split(":")[0], coupon.duration.startTime.split(":")[1], 00));
        payload.validity.endTime = new Date(new Date(coupon.duration.endDate).setHours(coupon.duration.endTime.split(":")[0], coupon.duration.endTime.split(":")[1], 00));
    
        if (coupon.discountOptions) {
            updatedCoupon.discountOptions = {
                type: coupon.discountOptions.type,
                value: coupon.discountOptions.value
            }
        }
    
        if (coupon.discountOptions.validFor !== "global") {
            updatedCoupon.discountFrom = {
                partnerID: coupon.discountOptions.validFor.partnerID,
                name: coupon.discountOptions.validFor.name
            };
        }

        if (coupon.minRequirement.minvalue) {
            updatedCoupon.minimumAmount = coupon.minRequirement.minvalue;
        }
    
        let newCoupon = await Coupons.findOneAndUpdate({ id: id }, updatedCoupon, { upsert: false }).exec();
    
        if (!newCoupon) {
            throw new Error(newCoupon);
        }
        
        // logger.info("createCoupons(): Coupon created successfully " + newCoupon);

        return res.status(200).json({
            code: 200,
            message: "Coupon created successfully",
            coupon: newCoupon
        })

    } catch(err) {

        // logger.info("createCoupons(): Error creating coupon " + err);

        return res.status(500).json({
            code: 500,
            message: "Error creating coupon"
        });
        
    }

}

const deleteCoupon = async(req, res, next) => {

    const couponID = req.params.couponID;

    // logger.info("deleteCoupon(): Deleting coupon: " + couponID);

    try {

        const deleteCoupon = await Coupons.deleteOne({ id: couponID }).exec();
    
        if (!deleteCoupon) {
            throw new Error(deleteCoupon);
        }

        // logger.info("deleteCoupon(): Coupon deleted successfully " + couponID);

        return res.status(200).json({
            code: 200,
            message: "Coupon deleted successfully"
        })

    } catch(err) {

        // logger.info("deleteCoupon(): Error deleting coupon: " + err);

        return res.status(500).json({
            code: 500,
            message: "Error deleting coupon"
        })

    }


}

const toggleisActive = async(req, res, next) => {

    const couponID = req.body.couponID;
    const isActive = req.body.status;

    // logger.info(`toggleisActive() Toggle status for Coupon ${couponID} - ${isActive}`);

    try {

        const toggleStatus = await Coupons.updateOne({ id: couponID }, {
            $set: {
                isActive: isActive
            }
        }).exec();

        if (!toggleStatus) {
            throw new Error(toggleStatus);
        }

        return res.status(200).json({
            code: 200,
            message: "Coupon updated successfully"
        })

    } catch(err) {
        
        return res.status(500).json({
            code: 200,
            message: "Coupon updated successfully"
        })

    }


}

module.exports = {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleisActive
}