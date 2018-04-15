var normalizedPath = require("path").join(__dirname, "market-services");
var market;
// Read all files in market-services directory, and export all of them.
require("fs").readdirSync(__dirname).forEach(function (file) {
    if (file.indexOf(".service.js") > -1){
        exports[file.split('.')[0]] = require("./" + file);
    }
});