var Rx = require('rxjs/Rx');
var axios = require('axios')

function get(url) {
    return Rx.Observable.fromPromise(axios.get(url));
}
function post(url) {
    return Rx.Observable.fromPromise(axios.post(url));
}

module.exports = {
    get: get,
    post: post
};