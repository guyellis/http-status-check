"use strict";

var request = require('request');
var _ = require('lodash');
var manager = require('./code/manager');
var inAdapter = require('./inAdapters/fileAdapter');
var outAdapter = require('./outAdapters/consoleAdapter');

function main() {
	var runData = inAdapter.getRunData();
	manager.run(runData, outAdapter);
}

main();
