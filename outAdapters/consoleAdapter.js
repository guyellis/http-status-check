
"use strict";
var _ = require('lodash');

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var organizeErrors = function(errors) {
	if(!Array.isArray(errors)){
		if(_.isObject(errors)){
			var accumulator = [];
			for(var property in errors) {
				if(errors.hasOwnProperty(property)){
					accumulator.push(property + ': ' + errors[property]);
				}
			}
			errors = accumulator;
		} else {
			errors = [errors];
		}
	}
	return _.flatten(errors);
};

var writeResult = function(result, uri) {
	switch(result) {
		case 'success':
			console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
			successHits++;
			break;
		case 'fail':
			console.log('X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:');
			// console.log('uri.errors: ', uri.errors);
			if(uri.errors) {
				uri.errors = organizeErrors(uri.errors);
				for (var i = 0, n = uri.errors.length; i < n; i++) {
					console.log('  - ' + uri.errors[i]);
				}
			}
			failHits++;
			break;
		case 'disabled':
			console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') testing disabled.');
			disableHits++;
			break;
		default:
			throw new Error('unknown case statement: ' + result);
			break;
	}
};

var done = function() {
	console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
	console.log('Failure count: ', failHits);
	console.log('Success count: ', successHits);
	console.log('Disable count: ', disableHits);
};

var successCount = function() {
	return successHits;
};

var failCount = function() {
	return failHits;
};

module.exports = {
	writeResult: writeResult,
	done: done,
	// Expose for testing
	successCount: successCount,
	failCount: failCount,
	organizeErrors: organizeErrors
};
