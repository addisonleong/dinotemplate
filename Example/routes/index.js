var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var model = require('../templates/dino').model;

var index = function(request, response) {
	var options = {
		"VALUE": "Stegosaurus",
		"titles": [
			{
				"title": "Dinosaur"
			}
		],
		"login": true
	};
	// console.log(navbar);
	response.render('index', options);
}

module.exports = index;