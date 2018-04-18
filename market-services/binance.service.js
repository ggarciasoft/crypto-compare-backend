var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://api.binance.com";
var getMarketUrl = `${hostUrl}/api/v3/ticker/bookTicker`;
var market = Constants.BINANCE;
var principalCurrencies = ["BTC", "ETH", "USDT", "BNB"]

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (response.data.code) {
                var msg = `Error on ${market}: getMarket: ${response.data.code} ${response.data.msg} `;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            subscriber.next({
                Exchange: market,
                Currencies: response.data.map(market => {
                    return {
                        CurrencyPair: getCurrencyPair(market.symbol),
                        Buy: new bignumber(market.bidPrice).toFixed(),
                        Sell: new bignumber(market.askPrice).toFixed()
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

function getCurrencyPair(symbol){
    for(var principalCurrency of principalCurrencies){
        if(new RegExp(principalCurrency + "\\b").test(symbol)){
            return `${principalCurrency}-${symbol.replace(principalCurrency, "")}`;
        }
    }
}

module.exports = {
    getMarket
};