
"use strict";

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var writeResult = function(result, resultObject) {
	switch(result) {
		case 'success':
			console.log('_ ' + resultObject.name + ' (' + resultObject.requestUrl + ') working as expected.');
			successHits++;
			break;
		case 'fail':
			console.log('X ' + resultObject.name + ' (' + resultObject.requestUrl + ') failed. Here are the problems:');
			for(var i= 0, n=resultObject.errors; i<n; i++) {
				console.log('    ' + resultObject.errors[i]);
			}
			failHits++;
			break;
		case 'disabled':
			console.log('_ ' + resultObject.name + ' (' + resultObject.requestUrl + ') testing disabled.');
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
	failCount: failCount
};
