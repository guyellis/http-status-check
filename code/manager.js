"use strict";

var uriCheck = require('./uriCheck');
var _ = require('lodash');
var async = require('async');

var iterateURLs = function(concurrentRequests, sites) {
	async.eachLimit(sites, concurrentRequests, uriCheck.checkUri, function(err) {
		if(err) {
			throw err;
		}
		uriCheck.done();
	});
};

// This function accepts an array of sites and if
// the requestUrl on any of its elements is an array
// it will duplicate that element and split out the
// elements of the requestUrl array
var expandInput = function(sites) {
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
};

var run = function(runData, outAdapter) {
	var sites = expandInput(runData.sites);
	var concurrentRequests = runData.concurrentRequests;
  if(!concurrentRequests || isNaN(concurrentRequests) || concurrentRequests < 1) {
    concurrentRequests = 3;
  }
	uriCheck.init(outAdapter);
	iterateURLs(concurrentRequests, sites);
};

module.exports = {
	iterateURLs: iterateURLs,
	expandInput: expandInput,
	run: run
};
