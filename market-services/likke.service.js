var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://public-api.lykke.com";
var getMarketUrl = `${hostUrl}/api/AssetPairs/rate`;
var market = Constants.LIKKE;
var principalCurrencies = ["BTC", "ETH", "USD", "CHF"]

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getMarketUrl).subscribe(response => {
            if (!response.data) {
                var msg = `Error on ${market}: getMarket: ${response.data} `;
                console.log(msg);
                subscriber.error(msg);
                return;
            }
            subscriber.next({
                Exchange: market,
                Currencies: response.data.map(market => {
                    return {
                        CurrencyPair: getCurrencyPair(market.id),
                        Buy: new bignumber(market.bid.toString()).toFixed(),
                        Sell: new bignumber(market.ask.toString()).toFixed()
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