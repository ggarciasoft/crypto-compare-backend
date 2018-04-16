var http = require('../utils/http')
var Observable = require('rxjs/Observable').Observable
var Constants = require('../models/constants')
var bignumber = require("../utils/bignumber")

const Service = require("./ether-delta/js/service");

const user = {
    addr: '0xb92aa5e56b12fc1cd9238e948ae025d0d8d13d44',
    pk: '',
};

const config = {
    addressEtherDelta: '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819',
    provider: 'https://mainnet.infura.io/Ky03pelFIxoZdAUsr82w',
    socketURL: 'https://socket.etherdelta.com',
    gasLimit: 150000,
    gasPrice: 4000000000,
};

const service = new Service();
const token = {
    addr: '0x1961b3331969ed52770751fc718ef530838b6dee',
    decimals: 18,
};
var market = Constants.ETHERDELTA;

function getMarket() {
    return new Observable(subscriber => {
        console.log(`looking for data on: ${market}`);
        service.init(config)
            .then(() => {
                return service.waitForMarket(token, user);
            })
            .then(() => {
                return Promise.all([0]);
            })
            .then((results) => {
                let listTokenData = new Array();

                for (let pair in service.state.returnTicker) {
                    if (!pair.startsWith("0x")) {
                        let bodyPair = service.state.returnTicker[pair];
                        let sell = bodyPair.ask;
                        let buy = bodyPair.bid;
                        if (buy > 0 || sell > 0) {
                            listTokenData.push({
                                CurrencyPair: getCurrencyPair(pair),
                                Buy: new bignumber(buy).toFixed(),
                                Sell: new bignumber(sell).toFixed()
                            });
                        }
                    }
                }
                console.log(`finish for data on: ${market}`);
                subscriber.next({
                    Exchange: market,
                    Currencies: listTokenData
                });
                subscriber.complete();
            });
    })
}

function getCurrencyPair(symbol) {
    return symbol.replace("_", "-");
}

module.exports = {
    getMarket
};