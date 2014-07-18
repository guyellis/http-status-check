
"use strict";
var _ = require('lodash');
var emailTemplates = require('email-templates');

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var success = [];
var fail = [];
var disabled = [];

var organizeErrors = function(errors) {
	if(!Array.isArray(errors)){
		if(_.isObject(errors)){
			var accumulator = [];
			for(var property in errors) {
				if(errors.hasOwnProperty(property)){
					accumulator.push(property + ': ' + errors[property]);
				}
			}
			errors = accumulator;
		} else {
			errors = [errors];
		}
	}
	return _.flatten(errors);
};

var writeResult = function(result, uri) {
	switch(result) {
		case 'success':
			success.push('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
			successHits++;
			break;
		case 'fail':
      if(uri.errors) {
        uri.errors = organizeErrors(uri.errors);
      }
			fail.push({
        text: 'X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:',
        errors: uri.errors
      });
			// console.log('uri.errors: ', uri.errors);
			failHits++;
			break;
		case 'disabled':
			disabled.push('_ ' + uri.name + ' (' + uri.requestUrl + ') testing disabled.');
			disableHits++;
			break;
		default:
			throw new Error('unknown case statement: ' + result);
	}
};

var done = function() {
  // TODO: Send the info in the arrays via email if failHits > 0
//	console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
//	console.log('Failure count: ', failHits);
//	console.log('Success count: ', successHits);
//	console.log('Disable count: ', disableHits);
};

module.exports = {
	writeResult: writeResult,
	done: done
};
