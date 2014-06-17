
"use strict";

var successCount = 0;
var failCount = 0;

var writeResult = function(resultObject) {
	if(resultObject.success) {
		console.log('_ ' + resultObject.name + ' (' + resultObject.uri + ') working as expected.');
		successCount++;
	} else {
		console.log('X ' + resultObject.name + ' (' + resultObject.uri + ') failed. Here are the problems:');
		for(var i= 0, n=resultObject.errors; i<n; i++) {
			console.log('    ' + resultObject.errors[i]);
		}
		failCount++;
	}
};

var done = function() {
	console.log('A total of ' + (successCount + failCount) + ' URIs were tested.');
	console.log('Failures: ', failCount);
	console.log('Successes: ', successCount);
};

module.exports = {
	writeResult: writeResult,
	done: done
};
