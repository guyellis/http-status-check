
var fs = require('fs');

var getRunData = function() {
  var standard = __dirname + '/../checksites.js';
  var sample = __dirname + '/../samplesites.js';
  if(fs.existsSync(standard)) {
    return require(standard);
  } else if(fs.existsSync(sample)) {
    return require(sample);
  } else {
    throw new Error('Expecting checksites.js or samplesites.js to exist.');
  }
};

module.exports = {
  getRunData: getRunData
};