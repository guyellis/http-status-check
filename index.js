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
			console.log('X ' + site.name + ' failed. Expected HTTP status of ' +
					site.expectedStatus + ' and got ' + response.statusCode + '.');
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
					console.log('_ ' + site.name + ' working as expected.');
				} else {
					console.log('X ' + site.name + ' returned the expected status but some of the headers did not match:');
					console.log(accumulatedHeaderFails);
				}
			} else {
				console.log('_ ' + site.name + ' working as expected.');
			}
		}
	});
}

function run(filename) {
	var file = require(filename);
	// console.log(file);
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
