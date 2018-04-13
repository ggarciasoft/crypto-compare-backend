var Rx = require('rxjs/Rx');
// import 'rxjs/observable/frompromise';
//import { Observable } from 'rxjs/observable'
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