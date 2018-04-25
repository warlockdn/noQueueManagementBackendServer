const mongoose = require('mongoose');
const express = require('express');
const Partner = require('./../models/partnerModel');

const jwtProvider = require('../providers/token-generator');
const util = require('../providers/utils');

const validateBoss = (username, password) => {
    if (username === '700' && password === 'admin') {
        return true
    } else {
        return false
    }
};

const authenticate = ((req, res, next) => {

    const username = req.body.username;
    const password = req.body.password;
    const type = req.body.type;
    
    if (type === 'partner') {
        Partner.findOne({ partnerID: username }, (err, user) => {
            if(err) { return done(err); }
            if (!user) {
                res.status(401).json({
                    status: 401,
                    message: 'Incorrect Credentials'
                })
            }
            if (!user.validatePassword(user.password, password)) {
                res.status(401).json({
                    status: 401,
                    message: 'Incorrect Credentials'
                })
            }

            const payload = {
                user: {
                    i: user.partnerID, // ID
                    t: 'partner', // Type
                    p: Buffer.from(util.getClientIp(req).toString('base64')), // IP
                    u: req.headers['user-agent'] // User Agent
                }
            }

            jwtProvider.generator(payload).then(
                (token) => {
                    res.status(200).json({
                        status: 200,
                        token: token
                    })
            }).catch(
                (err) => {
                    res.status(500).json({
                        status: 500,
                        message: 'Internal Server Error'
                    })
            })

            // Adding user type.
            // user.type = 'partner';
            
        })
    } else if (type === 'boss') {
        
        // Validating Admin - BOSS
        const result = validateBoss(username, password);
        if (result) {

            const payload = {
                user: {
                    i: result.username, // ID
                    t: 'boss', // Type
                    p: Buffer.from(util.getClientIp(req).toString('base64')), // IP
                    u: req.headers['user-agent'] // User Agent
                }
            }

            jwtProvider.generator(payload).then(
                (token) => {
                    res.status(200).json({
                        status: 200,
                        token: token,
                    })
            }).catch(
                (err) => {
                    res.status(500).json({
                        status: 500,
                        message: 'Internal Server Error',
                    })
            })

        } else {
            res.status(401).json({
                status: 401,
                message: 'Incorrect Credentials',
            })
        }
    } else {
        res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
        })
    }
})

const getStatus = ((req, res, next) => {
    
})

const logout = ((req, res, next) => {
    res.json({
        status: 200,
        message: 'Logged out successfully'
    })
})

module.exports = { authenticate, logout }