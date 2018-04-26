const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load RSA Keys
const private_cert = fs.readFileSync('cert/private.key', 'utf8');
const public_cert = fs.readFileSync('cert/public.key', 'utf8');

const jwtMiddleware = (req, res, next) => {

    const token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

    jwt.verify(token, public_cert, { audience: 'webapp' }, function(err, decoded) {
        try {
            if (!err && decoded.iss === 'boss') {

                if (decoded.user.t === 'boss') { req.body.usertype = 'boss' } 
                else if (decoded.user.t === 'partner') { 
                    req.body.usertype = 'partner';
                    req.body.partnerID = decoded.user.i;
                } 
                else { throw 'err' }

                next();
            } else {
                throw 'err';
            }
        }        
        catch(err) {
            res.status(401).json({
                statusCode: 401,
                messsage: 'Unauthorized'
            })
        }
    });
}

module.exports = { jwtMiddleware }