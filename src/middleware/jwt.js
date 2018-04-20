const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load RSA Keys
const private_cert = fs.readFileSync('cert/private.key', 'utf8');
const public_cert = fs.readFileSync('cert/public.key', 'utf8');

const jwtMiddleware = (req, res, next) => {

    const token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

    jwt.verify(token, public_cert, { audience: 'webapp' }, function(err, decoded) {
        if (!err && decoded.iss === 'boss') {
            next();
        } else {
            res.status(401).json({
                statusCode: 401,
                messsage: 'Server Error'
            })
        }
    });
}

module.exports = { jwtMiddleware }