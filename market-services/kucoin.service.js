var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://api.kucoin.com";
var getMarketUrl = `${hostUrl}/v1/open/tick`;
var market = Constants.KUCOIN;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (!response.data.success) {
                var msg = `Error on ${market}: getMarket: ${response.data.msg} `;;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            subscriber.next({
                Exchange: market,
                Currencies: response.data.data.map(market => {
                    return {
                        CurrencyPair: getCurrencyPair(market.symbol),
                        Buy: new bignumber(market.buy).toFixed(),
                        Sell: new bignumber(market.sell).toFixed()
                    }
                })
            });
            subscriber.complete();
            console.log(`finish for data on: ${market}`);
        }, err => {
            console.log(`error for data on ${market}: ${err}`);
            subscriber.error(err);
        });
    })
}

function getCurrencyPair(symbol) {
    var currency = symbol.split("-");
    return `${currency[1]}-${currency[0]}`
}

module.exports = {
    getMarket
};