var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://yobit.net";
var getMarketUrl = `${hostUrl}/api/3/ticker/`;
var getAllCurrenciesUrl = `${hostUrl}/api/3/info`;
var market = Constants.YOBIT;

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
            let marketsObservables = [];
            let i = 0;
            for (let pair in bodyCurrencies.data.pairs) {
                i++;
                if (pair.indexOf("btc") != -1 || pair.indexOf("eth") != -1 || pair.indexOf("doge") != -1) {
                    alltokens.push(pair);
                }

                if (alltokens.length == 50 || bodyCurrencies.data.pairs.length == i) {
                    console.log("tokens on yobit: " + i);
                    marketsObservables.push(http.get(getMarketUrl + alltokens.join("-")));
                    alltokens = [];
                }
            }

            Observable.forkJoin(marketsObservables)
                .subscribe(responses => {
                    let firstResponse = responses[0];
                    if (firstResponse.success === "0") {
                        var msg = `Error getting markets on ${firstResponse.error}`;
                        console.log(msg);
                        subscriber.error(msg);
                        return;
                    }

                    let listTokenData = new Array();
                    responses.forEach(response => {
                        for (let pair in response.data) {
                            let bodyPair = response.data[pair];
                            let sell = bodyPair.sell;
                            let buy = bodyPair.buy;
                            listTokenData.push({
                                CurrencyPair: getCurrencyPair(pair.toUpperCase()),
                                Buy: buy, //TODO: fix number
                                Sell: sell
                            });
                        }
                    })
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