var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var app = express()
var market = require("./market-services/market")
var Observable = require('rxjs/Observable').Observable

app.use(cors())
app.use(bodyParser.json())

app.get('/currencies', (req, res) => {
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

// app.get('/currencies', (req, res) => {
//     let exchanges = [];
//     let totalExchanges = 0;
//     let completedExchanges = 0;
//     let errors = "";
//     for (var k in market) {
//         if (market.hasOwnProperty(k)) {
//             ++totalExchanges;
//         }
//     }

//     for (var exchange in market) {
//         market[exchange].getMarket()
//             .subscribe(
//                 data => {
//                     exchanges.push(data);
//                 }, err => {
//                     errors += err;
//                     console.error(err);
//                 }, _ => {
//                     completedExchanges++;
//                     if (completedExchanges >= totalExchanges) {
//                         //if (errors) {
//                             console.log("Error: " + errors);
//                             //res.status(500).send(errors)
//                         //} else {
//                             console.log("Send Info");
//                             res.status(200).send(exchanges);
//                         //}
//                     }
//                 });
//     }
// })

app.listen(process.env.PORT || 3000)