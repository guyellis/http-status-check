"use strict";

var request = require('request');
var uriCheck = require('./uriCheck');
var _ = require('lodash');
var async = require('async');

var iterateURLs = function(concurrentRequests, sites) {
	async.eachLimit(sites, concurrentRequests, iterator, function(err) {
		if(err) {
			console.log('Error: ', err);
		}
		uriCheck.done();
	});
};

var iterator = function(site, callback) {
		return uriCheck.siteCheck(site, callback);
};

module.exports = {
	iterateURLs: iterateURLs
	// For testing
};
