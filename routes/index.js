var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var model = require('../templates/dino').model;

var index = function(request, response) {
	var options = {
		"titles": [
			{
				"title": "Addison"
			}
		]
	};
	// console.log(navbar);
	response.render('index', options);
}

module.exports = index;