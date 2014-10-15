"use strict";

var manager = require('./lib/manager');
var settings = require('./package.json');
var inAdapter = require(settings.in_adapter.type);
var outAdapter = require(settings.out_adapter.type);

var main = function() {
	var runData = inAdapter.getRunData(); // array of sites as objects
	manager.run(runData, outAdapter);
};

main();

module.exports = {
	main: main
};
