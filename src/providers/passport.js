// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Partner = require('./../models/partnerModel');

const validateBoss = (username, password) => {
    if (username === 700 && password === 'p@ssw0rd1234$$!!') {
        return true
    } else {
        return false
    }
};

function setupPassport(passport) {

    passport.serializeUser((user, callback) => {
        if(user.type === 'boss') {
            callback(null, user.id)
        } else {
            callback(null, user.partnerID)
        }
    })
    
    passport.deserializeUser((user, callback) => {
        if(user.type === 'boss' && user.id === 700) {
            done(null, user)
        } else if (user.type === 'partner') {
            Partner.findById(id, (err, user) => {
                done(err, user)
            })
        } else {
            done(null, null);
        }
    })

    passport.use(new LocalStrategy(
        (username, password, type, done) => {
    
            // Dividing authentication mechanism according to the source of request.
    
            // Validating Partner
            if (type === 'partner') {
                Partner.findOne({ partnerID: username }, (err, user) => {
                    if(err) { return done(err); }
                    if (!user) {
                        return done(null, false, { status: 401, message: 'Incorrect Credentials.' })
                    }
                    if (!user.validatePassword(password)) {
                        return done(null, false, { status: 401, message: 'Incorrect Credentials.' })
                    }
    
                    // Adding user type.
                    user.type = 'partner';
                    return done(null, user);
                })
            } else if (type === 'boss') {
                
                // Validating Admin - BOSS
                const result = validateBoss(username, password);
                if (result) {
                    return done(null, {
                        id: 700,
                        type: boss
                    })
                }
            } else {
                return done(null, false, { status: 500, message: 'Request terminated' })
            }
        }
    ))

}

module.exports = { setupPassport }