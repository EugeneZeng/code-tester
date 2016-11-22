//queryData.js
var express = require('express');
var router = express.Router();

var previousMax = 0;
var getRandomData = function(length){
    var data = {data: []};
    for(var i = 0; i < length; i++){
        data.data.push({
            number: (previousMax + i + 1),
            random: Math.random().toString().slice(2)
        });
    }
    console.log("getRandomData: "+previousMax);
    previousMax += i;
    return data;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
    var length = req.query.length ? req.query.length : 100;
    if(req.query.renew == 1){
        previousMax = 0;
        console.log(previousMax);
    }
    res.send(getRandomData(length));
});

module.exports = router;