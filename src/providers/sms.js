const request = require('request');

const send = (phoneNumber, partner, userid, password) => {
    
    let param = {
            sender: process.env.SMS_SENDER_REG,
            route: 4,
            mobiles: '91' + phoneNumber,
            country: 91,
            authkey: process.env.SMS_AUTH_KEY,
            message: `Welcome aboard Partner,\nID: ${userid}\nPwd: ${password}\nLooking forward,\nTeam Demo`
    }   
    
    request.get({uri: process.env.SMS_HOST, qs: param}, function(err, response, body) {
        console.log('Message sent successfully to ', phoneNumber)
    })

}

module.exports = { send }