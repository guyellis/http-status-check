"use strict";

var fs = require('fs');
var request = require('request');
var _ = require('lodash');

var siteCheck = function(site) {
	if (site.disabled) {
		console.log('_ ' + site.name + ' (' + site.requestUrl + ') skipped because disabled.');
		return true;
	}
	return eachSite(site);
};

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

module.exports = {
	siteCheck: siteCheck
};
