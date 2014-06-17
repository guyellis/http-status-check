"use strict";

var fs = require('fs');
var request = require('request');
var _ = require('lodash');

function siteCheck(site) {
	if (site.disabled) {
		console.log('_ ' + site.name + ' (' + site.requestUrl + ') skipped because disabled.');
		return true;
	}
	var results = {success: 0, failure: 0};
	return eachSite(site);
}

function lowerStartsWith(first, second) {
	return first.toLowerCase().indexOf(0,second.length) === second.toLowerCase();
}

function eachSite(site) {
	var options = {
		followRedirect: false,
		uri: site.requestUrl
	};
	// Check that uri has a protocol
	if(!lowerStartsWith(options.uri,'http://') || !lowerStartsWith(options.uri,'https://'))
	{
		options.uri = 'http://' + options.uri;
	}

	if(site.requestHeaders) {
		options.headers = site.requestHeaders;
	}
	request.get(options, function(error, response, body) {
		if(error) {
			console.log('X ' + site.name + ' (' + site.requestUrl + ') error: ', error);
			return false;
		} else {
		if(response.statusCode !== site.expectedStatus) {
			console.log('X ' + site.name + ' (' + site.requestUrl + ') failed. Expected HTTP status of ' +
					site.expectedStatus + ' and got ' + response.statusCode + '.');
			return false;
		} else {
			if(site.responseHeaders) {
				var accumulatedHeaderFails = [];
				for (var header in site.responseHeaders) {
					if (site.responseHeaders.hasOwnProperty(header)) {
						var actualHeaderValue = response.headers[header];
						var expectedHeaderValue = site.responseHeaders[header];
						if(actualHeaderValue !== expectedHeaderValue) {
							accumulatedHeaderFails.push(
									'Expected header \'' + header + '\' to be ' +
											expectedHeaderValue + ' but instead it was ' +
											actualHeaderValue
							);
						}
					}
				}
				if(accumulatedHeaderFails.length === 0) {
					console.log('_ ' + site.name + ' (' + site.requestUrl + ') working as expected.');
					return true;
				} else {
					console.log('X ' + site.name + ' (' + site.requestUrl + ') returned the expected status but some of the headers did not match:');
					console.log(accumulatedHeaderFails);
					return false;
				}
			} else {
				console.log('_ ' + site.name + ' (' + site.requestUrl + ') working as expected.');
				return true;
			}
		}
		}
	});
}

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
		if(siteCheck(site)) {
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
