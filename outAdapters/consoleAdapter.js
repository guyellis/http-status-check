
"use strict";

var successHits = 0;
var failHits = 0;

var writeResult = function(resultObject) {
	if(resultObject.success) {
		console.log('_ ' + resultObject.name + ' (' + resultObject.uri + ') working as expected.');
		successHits++;
	} else {
		console.log('X ' + resultObject.name + ' (' + resultObject.uri + ') failed. Here are the problems:');
		for(var i= 0, n=resultObject.errors; i<n; i++) {
			console.log('    ' + resultObject.errors[i]);
		}
		failHits++;
	}
};

var done = function() {
	console.log('A total of ' + (successCount + failCount) + ' URIs were tested.');
	console.log('Failures: ', failCount);
	console.log('Successes: ', successCount);
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
