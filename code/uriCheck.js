"use strict";

var fs = require('fs');
var request = require('request');
var _ = require('lodash');
var outAdapter = require('../outAdapters/consoleAdapter');

var siteCheck = function(site) {
	if (site.disabled) {
		outAdapter.writeResult('disabled', site);
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
			site.errors = error;
			outAdapter.writeResult('fail', site);
			return false;
		} else {
			if(response.statusCode !== site.expectedStatus) {
				var err = 'Expected HTTP status of ' + site.expectedStatus + ' and got ' + response.statusCode + '.';
				site.errors = [err];
				outAdapter.writeResult('fail', site);
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
						outAdapter.writeResult('success', site);
						return true;
					} else {
						site.errors = accumulatedHeaderFails;
						outAdapter.writeResult('fail', site);
						return false;
					}
				} else {
					outAdapter.writeResult('success', site);
					return true;
				}
			}
		}
	});
}

module.exports = {
	siteCheck: siteCheck
};
