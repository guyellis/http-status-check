
var fs = require('fs');

var getRunData = function() {
	var standard = __dirname + '/../checksites.json';
	var sample = __dirname + '/../samplesites.json';
	if(fs.existsSync(standard)) {
		return require(standard);
	} else if(fs.existsSync(sample)) {
		return require(sample);
	} else {
		throw new Error('Expecting checksites.json or samplesites.json to exist.');
	}
};

module.exports = {
	getRunData: getRunData
};

