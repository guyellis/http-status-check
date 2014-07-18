'use strict';
var path = require('path');
var templatesDir = path.resolve(__dirname, 'templates');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var _ = require('lodash');

var emailData = require('./emailActualData');

console.log('templatesDir: ', templatesDir);

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

var sendEmail = function() {
  emailTemplates(templatesDir, function(err, template) {

    if (err) {
      throw err;
    } else {
      var transport = nodemailer.createTransport("SMTP", emailData.transport);

      // Send a single email
      template('basic', emailData.locals, function(err, html/*, text*/) {
        if (err) {
          console.log(err);
        } else {
          transport.sendMail({
            from: emailData.from.name.first + ' ' + emailData.from.name.last + ' <' + emailData.from.email + '>',
            to: emailData.locals.email,
            subject: emailData.subject + ' ' + Date.now().toString(),
            html: html,
            generateTextFromHTML: true
            // text: text
          }, function(err, responseStatus) {
            if (err) {
              throw err;
            } else {
              console.log('responseStatus.message: ', responseStatus.message);
            }
          });
        }
      });
    }
  });
};

var done = function() {
//	console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
//	console.log('Failure count: ', failHits);
//	console.log('Success count: ', successHits);
//	console.log('Disable count: ', disableHits);
  if(failHits > 0) {
    // We'll send an email if there are any failures.
    // If this is run infrequently (say daily) then you may want to send a success email as
    // well as a heartbeat to confirm that this is running on a schedule or timer.
    sendEmail();
  }
};

module.exports = {
	writeResult: writeResult,
	done: done
};
