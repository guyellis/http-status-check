"use strict";

var fs = require('fs');
var request = require('request');
var _ = require('lodash');
var uriCheck = require('./code/uriCheck');

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
	var successCount = 0;
	var failureCount = 0;
	var sites = expandInput(file.sites);
	for(var i=0, n=sites.length; i<n; i++) {
		var site = sites[i];
		if(uriCheck.siteCheck(site)) {
			successCount++;
		} else {
			failureCount++;
		}
	}
	console.log('Checked ' + (successCount + failureCount) + ' sites.');
	console.log('Failed: ' + failureCount);
	console.log('Succeeded: ' + successCount);
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
