const resolve = require('url');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load RSA Keys
const private_cert = fs.readFileSync('cert/private.key', 'utf8');
const public_cert = fs.readFileSync('cert/public.key', 'utf8');

const generator = (payload) => {

    const options = {
        algorithm: 'RS256',
        expiresIn: "1d",
        audience: 'webapp',
        issuer: 'boss',
        noTimestamp: false,
        jwtid: (Date.now()).toString()
    }

    return new Promise((resolve, reject) => {
        jwt.sign(payload, private_cert, options, (err, token) => {
            if (err) return reject()
            resolve(token)
        })
    })

}

const refresh = (token) => {
    const payload = jwt.verify(token, public_cert);
    delete payload.iat;
    delete payload.exp;
    delete payload.jti;

    jwt.sign(payload, private_cert, {
        jwtid: (Date.now()).toString()
    }, (err, token) => {
        if (err) return 'err';
        return token;
    })
}

module.exports = {
    generator
};