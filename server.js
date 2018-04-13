var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
var market = require("./market-services/market")
var Observable = require('rxjs/Observable').Observable

app.use(cors())
app.use(bodyParser.json())

app.get('/currencies', async (req, res) => {
    let exchanges = [];
    let totalExchanges = 0;
    let completedExchanges = 0;
    let errors = "";
    for (var k in market) {
        if (market.hasOwnProperty(k)) {
            ++totalExchanges;
        }
    }

    for (var exchange in market) {
        market[exchange].getMarket()
            .subscribe(
                data => {
                    exchanges.push(data);
                }, err => {
                    errors += err;
                    console.error(err);
                }, _ => {
                    completedExchanges++;
                    if (completedExchanges >= totalExchanges) {
                        if (errors) {
                            res.status(500).send(errors)
                        } else {
                            res.status(200).send(exchanges);
                        }
                    }
                });
    }
})

app.listen(process.env.PORT || 3000)