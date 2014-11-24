"use strict";

var _ = require('lodash');
var manager = require('./lib/manager');
var settings = require('./package.json');
var inAdapter = require(settings.inAdapter.type);
var outAdapter = require('./lib/outAdapters/consoleAdapter');

var onlyOutputFails = _.contains(process.argv.slice(2), '--only-output-failures');
var main = function(onlyOutputFails) {
  var runData = inAdapter.getRunData();
  manager.run(runData, outAdapter, onlyOutputFails);
};

main(onlyOutputFails);

module.exports = {
  main: main
};
