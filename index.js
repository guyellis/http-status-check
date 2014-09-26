"use strict";

var manager = require('./lib/manager');
var settings = require('./package.json');
var inAdapter = require(settings.in_adapter.type);
var outAdapter = require('./lib/outAdapters/consoleAdapter');

var main = function() {
	var runData = inAdapter.getRunData();
	manager.run(runData, outAdapter);
};

main();

module.exports = {
	main: main
};
