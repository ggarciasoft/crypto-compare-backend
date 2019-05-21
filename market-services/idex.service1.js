var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://api.idex.market";
var getMarketUrl = `${hostUrl}/returnOrderBook`;
var getAllCurrenciesUrl = `${hostUrl}/returnTicker`;
var market = Constants.IDEX;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.get(getAllCurrenciesUrl).subscribe(bodyCurrencies => {
            if (!bodyCurrencies.data) {
                var msg = `Error getting currencies on ${market}`;
                console.log(msg);
                subscriber.error(msg);
                return;
            }

            let marketsObservables = [];
            for (let pair in bodyCurrencies.data) {
                if (pair.indexOf("ETH") != -1 && pair.indexOf(":") === -1) {
                    marketsObservables.push(http.post(getMarketUrl, {
                        market: pair
                    }));
                }
            }

            Observable.forkJoin(marketsObservables)
                .subscribe(responses => {
                    let listTokenData = new Array();
                    responses.forEach(response => {
                        if (response.data.bids && response.data.asks) {
                            let ask = response.data.asks[0];
                            let bid = response.data.bids[0];
                            if (bid && ask && bid.price && ask.price) {
                                listTokenData.push({
                                    CurrencyPair: getCurrencyPair(ask),
                                    Buy: new bignumber(bid.price).toFixed(),
                                    Sell: new bignumber(ask.price).toFixed()
                                });
                            }
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
    return `${symbol.params.buySymbol}-${symbol.params.sellSymbol}`
}

module.exports = {
    getMarket
};