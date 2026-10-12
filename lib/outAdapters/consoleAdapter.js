'use strict';

import _ from 'lodash';
//import bunyan from 'bunyan';
//var log = bunyan.createLogger({
//  name: 'http-status-check',
//  streams: [{
//      path: './httpstatuscheck.log'
//    }
//  ]
//});

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var organizeErrors = function(errors) {
  if(!Array.isArray(errors)){
    if(_.isObject(errors)){
      errors = _.map(errors, function(value, key){
        return key + ': ' + value;
      });
    } else {
      errors = [errors];
    }
  }
  return _.flatten(errors);
};

var writeResult = function(result, uri) {
  switch(result) {
    case 'success':
      if(uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
      }
      successHits++;
      break;
    case 'fail':
      console.log('X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:');
      if(uri.errors) {
        uri.errors = organizeErrors(uri.errors);
        _.forEach(uri.errors, function(error) { console.log('  - ' + error); } );
      }
      failHits++;
      break;
    case 'disabled':
      if(uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') testing disabled.');
      }
      disableHits++;
      break;
    default:
      throw new Error('unknown case statement: ' + result);
  }
};

var done = function() {
  console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
  console.log('Failure count: ', failHits);
  console.log('Success count: ', successHits);
  console.log('Disable count: ', disableHits);
};

var getSuccessHits = function() {
  return successHits;
};

var getFailHits = function() {
  return failHits;
};

var getDisableHits = function() {
  return disableHits;
};

var resetHits = function() {
  successHits = 0;
  failHits = 0;
  disableHits = 0;
};

var consoleAdapter = {
  writeResult: writeResult,
  done: done,
  organizeErrors: organizeErrors,
  getSuccessHits: getSuccessHits,
  getFailHits: getFailHits,
  getDisableHits: getDisableHits,
  resetHits: resetHits
};

export {
  writeResult,
  done,
  organizeErrors,
  getSuccessHits,
  getFailHits,
  getDisableHits,
  resetHits
};

export default consoleAdapter;

