
var fs = require('fs');
var standard = require('../checksites.js');
var sample = require('../samplesites.js');

var getRunData = function() {
	if(standard) {
		return standard;
	} else if(sample) {
		return sample;
	} else {
		throw new Error('Expecting checksites.js or samplesites.js to exist.');
	}
};

module.exports = {
	getRunData: getRunData
};

