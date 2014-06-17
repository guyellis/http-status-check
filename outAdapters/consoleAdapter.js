
"use strict";

var writeResult = function(resultObject) {
	if(resultObject.success) {
		console.log('_ ' + resultObject.name + ' (' + resultObject.uri + ') working as expected.');
	} else {
		console.log('X ' + resultObject.name + ' (' + resultObject.uri + ') failed. Here are the problems:');
		for(var i= 0, n=resultObject.errors; i<n; i++) {
			console.log('    ' + resultObject.errors[i]);
		}
	}
};

module.exports = {
	writeResult: writeResult
};
