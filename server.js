var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
var market = require("./market-services/market")
var Observable = require('rxjs/Observable').Observable
var cache = require("./utils/cache");

app.use(cors())
app.use(bodyParser.json())

app.get('/currencies', cache(30), (req, res) => {
    let exchanges = [];
    let totalExchanges = 0;
    let completedExchanges = 0;
    let errors = "";
    for (var k in market) {
        if (market.hasOwnProperty(k)) {
            ++totalExchanges;
        }
    }

    let marketsObservables = [];

    for (var exchange in market) {
        marketsObservables.push(market[exchange].getMarket());
    }
    Observable.forkJoin(marketsObservables).subscribe(data => {
        console.log("log");
        res.status(200).send(data);
    }, err => {
        res.status(500).send(err.message);
    });
})

app.listen(process.env.PORT || 3000)