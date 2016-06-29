'use strict';

var debug = require('debug')('http-status-check:fileAdapter');
var fs = require('fs');

function findFile() {
  var custom = process.env.HTTP_STATUS_CHECK_FILE;
  var standard = __dirname + '/../../sitelists/checksites.js';
  var sample = __dirname + '/../../sitelists/samplesites.js';
  if(custom && fs.existsSync(custom)) {
    return custom;
  } else if(fs.existsSync(standard)) {
    return standard;
  } else if(fs.existsSync(sample)) {
    return sample;
  } else {
    debug('standard: %s', standard);
    debug('sample: %s', sample);
    throw new Error('Expecting HTTP_STATUS_CHECK_FILE environment or checksites.js or samplesites.js to exist.');
  }
}

var getRunData = function() {
  var file = findFile();
  return require(file);
};

module.exports = {
  getRunData: getRunData
};
