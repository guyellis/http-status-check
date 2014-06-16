"use strict";

var fs = require('fs');
var request = require('request');

function siteCheck(site) {
	var options = {
		followRedirect: false,
		uri: site.requestUrl
	};
	if(site.requestHeaders) {
		options.headers = site.requestHeaders;
	}
	request.get(options, function(error, response, body){
		if(response.statusCode !== site.expectedStatus) {
			console.log('Failed check for ' + site.name +
					'. Expected HTTP status of ' + site.expectedStatus +
					' and got ' + response.statusCode + '.');
		} else {
			if(site.responseHeaders) {
				// TODO: Check response headers
				console.log('responseHeaders: ', site.responseHeaders);
			} else {
				console.log(site.name + ' working as expected.');
			}
		}
	});
}

function run(filename) {
	var file = require(filename);
	console.log(file);
	for(var i=0, n=file.sites.length; i<n; i++) {
		siteCheck(file.sites[i]);
	}
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
