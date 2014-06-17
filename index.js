"use strict";

var fs = require('fs');
var request = require('request');
var _ = require('lodash');
var manager = require('./code/manager');

// This function accepts an array of sites and if
// the requestUrl on any of its elements is an array
// it will duplicate that element and split out the
// elements of the requestUrl array
function expandInput(sites) {
	var result = _.map(sites,function(site){
		if(Array.isArray(site.requestUrl)){
			var urls = site.requestUrl;
			delete site.requestUrl;
			return _.map(urls, function(url){
				var newItem = _.cloneDeep(site);
				newItem.requestUrl = url;
				return newItem;
			});
		} else {
			return site;
		}
	});

	return _.flatten(result);
}

function run(filename) {
	var file = require(filename);
	// console.log(file);
	var sites = expandInput(file.sites);
	manager.iterateURLs(sites);
}

function main() {
	var standard = __dirname + '/checksites.json';
	var sample = __dirname + '/samplesites.json';
	if(fs.existsSync(standard)) {
		run(standard);
	} else if(fs.existsSync(sample)) {
		run(sample);
	} else {
		console.log('Expecting checksites.json or samplesites.json for data and expectation source');
	}
}

main();
