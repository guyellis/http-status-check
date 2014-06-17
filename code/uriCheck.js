"use strict";

var request = require('request');
require('sugar');
var outAdapter;

var init = function(output){
	outAdapter = output;
};

function startsWith(testString, protocols) {
	for(var i= 0,n=startsWith.length; i<n; i++) {
		if(testString.toLowerCase().startsWith(protocols[i].toLowerCase())) {
			return true;
		}
	}
	return false;
}

var checkUri = function(site, callback) {
	if (site.disabled) {
		outAdapter.writeResult('disabled', site);
		return callback(null);
	}

	var options = {
		followRedirect: false,
		uri: site.requestUrl
	};
	// Check that uri has a protocol
	if(!startsWith(options.uri,['http://','https://']))
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
			return callback(null);
		} else {
			if(response.statusCode !== site.expectedStatus) {
				var err = 'Expected HTTP status of ' + site.expectedStatus + ' and got ' + response.statusCode + '.';
				site.errors = [err];
				outAdapter.writeResult('fail', site);
				return callback(null);
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
						return callback(null);
					} else {
						site.errors = accumulatedHeaderFails;
						outAdapter.writeResult('fail', site);
						return callback(null);
					}
				} else {
					outAdapter.writeResult('success', site);
					return callback(null);
				}
			}
		}
	});
};

var done = function() {
	outAdapter.done();
};

module.exports = {
	done: done,
	checkUri: checkUri,
	init: init
};
