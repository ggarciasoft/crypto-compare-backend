var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

var hostUrl = "https://api.idex.market";
var getMarketUrl = `${hostUrl}/returnTicker`;
var market = Constants.IDEX;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        http.post(getMarketUrl).subscribe(body => {
            let listTokenData = new Array();

            for (let pair in body.data) {
                if (pair.indexOf("DAI") == -1) {
                    let bodyPair = body.data[pair];
                    let sell = bodyPair.last;
                    let buy = bodyPair.last;
                    if (sell != "N/A") {
                        listTokenData.push({
                            CurrencyPair: getCurrencyPair(pair),
                            Buy: new bignumber(sell).toFixed(),
                            Sell: new bignumber(buy).toFixed()
                        });
                    }
                }
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
        });
    })
}

function getCurrencyPair(symbol) {
    var currency = symbol.split("_");
    return `${currency[0]}-${currency[1]}`
}

module.exports = {
    getMarket
};