"use strict";

var manager = require('./lib/manager');
var inAdapter = require('./lib/inAdapters/fileAdapter');
var outAdapter = require('./lib/outAdapters/consoleAdapter');

var main = function() {
	var runData = inAdapter.getRunData();
	manager.run(runData, outAdapter);
};

main();

module.exports = {
	main: main
};
