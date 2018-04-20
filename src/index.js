// const successlog = require('./logger');
// const errorlog = require('./logger');
const express = require('express');
const unless = require('express-unless');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const helmet = require('helmet');
const Raven = require('raven');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const middleware = require('./middleware/jwt');
const appRoutes = require('./routes/routes');

// Must configure Raven before doing anything else with it
Raven.config(process.env.SENTRY_CODE, { sendTimeout: 5 }).install();

const app = express();
app.disable('x-powered-by');
app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(cors());

// Error Reporting
app.use(Raven.requestHandler());

/* app.use((err, req, res, next) => {
    if (req.path == '/auth/login') return next();
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res
        .status(403)
        .json({
            "error": "session has expired or tampered with"
        });
}); */

/* 
const isAuthenticated = ((req, res, next) => {
    if (req.path == '/auth/login') return next();
    if(!req.session.loggedIn) {
        err = new Error("Not authorized");
        next(err);
    }
    return next();
}) */

const jwtprovider = require('./providers/token-generator');

const jwtMiddleware = ((req, res, next) => {
    if (req.path === '/auth/login' || req.path === '/status') return next();
    middleware.jwtMiddleware(req, res, next);
});

const logRequests = ((req, res, next) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(url);
    next()
})

app.use(logRequests);
app.use(jwtMiddleware);

app.get('/status', (req, res) => {
    res.json({
        statusCode: 200,
        version: '0.1 Alpha',
        versionname: process.env.CODE_NAME
    })
})

app.use('/', appRoutes);

// The error handler must be before any other error middleware
app.use(Raven.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});

app.listen(3000);