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
            listTokenData = new Array();

            for (let pair in body.data) {
                if (pair.indexOf("DAI") == -1) {
                    var bodyPair = body.data[pair];
                    if (bodyPair.highestBid != "N/A" && bodyPair.lowestAsk != "N/A") {
                        listTokenData.push({
                            CurrencyPair: getCurrencyPair(bodyPair),
                            Buy: new bignumber(bodyPair.highestBid).toFixed(),
                            Sell: new bignumber(bodyPair.lowestAsk).toFixed()
                        });
                    }
                }
            }
            subscriber.next({
                Exchange: market,
                Markets: listTokenData
            });
            subscriber.complete();
            console.log(`finish for data on: ${market}`);
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