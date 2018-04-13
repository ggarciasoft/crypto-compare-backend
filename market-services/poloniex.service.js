var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://poloniex.com";
var getMarketUrl = `${hostUrl}/public?command=returnTicker`;
var market = Constants.POLONIEX;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (response.data.error) {
                var msg = `Error on ${market}: getMarket: ${response.data.error} `;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            var markets = [];
            for(var exchangeKey in response.data){
                var exchange = response.data[exchangeKey];
                markets.push({
                    CurrencyPair: getCurrencyPair(exchangeKey),
                    Buy: new bignumber(exchange.highestBid).toFixed(),
                    Sell: new bignumber(exchange.lowestAsk).toFixed()
                })
            }
            subscriber.next({
                Exchange: market,
                Markets: markets
            });
            subscriber.complete();
            console.log(`finish for data on: ${market}`);
        }, err => {
            console.log(`error for data on ${market}: ${err}`);
            subscriber.error(err);
        });
    })
}

function getCurrencyPair(symbol){
    var currency = symbol.split("_");
    return `${currency[0]}-${currency[1]}`
}

module.exports = {
    getMarket
};