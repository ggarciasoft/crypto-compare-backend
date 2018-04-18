var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://api.tidex.com";
var getMarketUrl = `${hostUrl}/api/3/ticker/`;
var getAllCurrenciesUrl = `${hostUrl}/api/3/info`;
var market = Constants.TIDEX;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getAllCurrenciesUrl).subscribe(bodyCurrencies => {
            if (!bodyCurrencies.data || !bodyCurrencies.data.pairs) {
                var msg = `Error getting currencies on ${market}`;
                console.log(msg);
                subscriber.error(msg);
                return;
            }

            let alltokens = [];
            for (let pair in bodyCurrencies.data.pairs) {
                alltokens.push(pair);
            }

            http.get(getMarketUrl + alltokens.join("-")).subscribe(bodyMarkets => {
                if (!bodyMarkets.data) {
                    var msg = `Error getting markets on ${market}`;
                    console.log(msg);
                    subscriber.error(msg);
                    return;
                }

                let listTokenData = new Array();

                for (let pair in bodyMarkets.data) {
                    let bodyPair = bodyMarkets.data[pair];
                    let sell = bodyPair.sell;
                    let buy = bodyPair.buy;
                    listTokenData.push({
                        CurrencyPair: getCurrencyPair(pair.toUpperCase()),
                        Buy: new bignumber(buy).toFixed(),
                        Sell: new bignumber(sell).toFixed()
                    });
                }
                subscriber.next({
                    Exchange: market,
                    Currencies: listTokenData
                });
                subscriber.complete();
                console.log(`finish for data on: ${market}`);
            }, err => {
                console.log(`error for data on ${market}: ${err}`);
                subscriber.error(err);
                subscriber.complete();
            });
        }, err => {
            console.log(`error for data on ${market}: ${err}`);
            subscriber.error(err);
            subscriber.complete();
        });
    })
}

function getCurrencyPair(symbol) {
    var currency = symbol.split("_");
    return `${currency[1]}-${currency[0]}`
}

module.exports = {
    getMarket
};