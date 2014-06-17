"use strict";

var request = require('request');
var uriCheck = require('./uriCheck');
var _ = require('lodash');

var iterateURLs = function(sites) {
	for(var i=0, n=sites.length; i<n; i++) {
		var site = sites[i];
		if(uriCheck.siteCheck(site)) {
//			successCount++;
		} else {
//			failureCount++;
		}
	}
	uriCheck.done();
};

module.exports = {
	iterateURLs: iterateURLs
	// For testing
};
