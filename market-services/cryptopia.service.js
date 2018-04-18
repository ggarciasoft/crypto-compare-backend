var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://www.cryptopia.co.nz";
var getMarketUrl = `${hostUrl}/api/GetMarkets`;
var market = Constants.CRYPTOPIA;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (!response.data.Success) {
                var msg = `Error on ${market}: getMarket: ${response.data.Message} `;;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            subscriber.next({
                Exchange: market,
                Currencies: response.data.Data.map(market => {
                    return {
                        CurrencyPair: getCurrencyPair(market.Label),
                        Buy: market.BidPrice ? market.BidPrice : 0,//TODO: fix number
                        Sell: market.AskPrice ? market.AskPrice : 0
                    }
                })
            });
            subscriber.complete();
            console.log(`finish for data on: ${market}`);
        }, err => {
            console.log(`error for data on ${market}: ${err}`);
            subscriber.error(err);
            subscriber.complete();
        });
    })
}

function getCurrencyPair(symbol) {
    var currency = symbol.split("/");
    return `${currency[1]}-${currency[0]}`
}

module.exports = {
    getMarket
};