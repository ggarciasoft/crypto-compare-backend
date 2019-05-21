var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://bittrex.com";
var getMarketUrl = `${hostUrl}/api/v1.1/public/getmarketsummaries`;
var market = Constants.BITTREX;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (!response.data.success) {
                var msg = `Error on ${market}: getMarket: ${response.data.message} `;;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            subscriber.next({
                Exchange: market,
                Currencies: response.data.result.map(market => {
                    return {
                        CurrencyPair: market.MarketName,
                        Buy: new bignumber(market.Bid).toFixed(),
                        Sell: new bignumber(market.Ask).toFixed()
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

module.exports = {
    getMarket
};