var mcache = require("memory-cache");

cache = (duration) => {
    return (req, res, next) => {
        let key = 'caching' + req.originalUrl || req.url;
        let cachedBody;
        if (req.query.get_cache) {
            cachedBody = mcache.get(key);
        }
        if (cachedBody) {
            res.send(cachedBody);
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

module.exports = cache;