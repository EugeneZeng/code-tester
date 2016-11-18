//queryData.js
var express = require('express');
var router = express.Router();

var getRandomData = function(length){
    var data = {data: []};
    for(var i = 0; i < length; i++){
        data.data.push({
            number: (i+1),
            random: Math.random().toString().slice(2)
        });
    }
    return data;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
    var length = req.query.length ? req.query.length : 100;
    res.send(getRandomData(length));
});

module.exports = router;