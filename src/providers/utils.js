const timeDiff = (time) => {
    const diff = (((time - Date.now()) / 1000) / 60) * 24;
    if (diff < (60 * 24)) return false;
    return true;
}

const getClientIp = (req) => {
    let ipAddress;
    // The request may be forwarded from local web server.
    const forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        let forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};

module.exports = { getClientIp }