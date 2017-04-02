var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var assert = require('assert');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('dino', require('./templates/dino').express);
app.set('views', './views');
app.set('view engine', 'dino');

var index = require("./routes/index");

app.get('/', index);

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});	
