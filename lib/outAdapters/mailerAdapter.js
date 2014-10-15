'use strict';

/* This version is similar to emailAdapter but has been tweaked to work with Nodemailer 1.4x */

var nodemailer = require('nodemailer');
var _ = require('lodash');
var debug = require('debug');

var emailData = require('./emailActualData');

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
	var transporter = nodemailer.createTransport({
		service: emailData.transport.service,
		auth: {
			user: emailData.transport.auth.user,
			pass: emailData.transport.auth.pass
		}
	});

	// Compose message
	var msg = '<h2>HTTP Status Check Report</h2>';
	msg += '<p>The following problems were found with your websites:</p>';
	msg += '<ul>';
	
	// Adding all fail errors
	for(var i=0; i<fail.length; i++){
		msg += '<li>'+fail[i].text.replace('Here are the problems:','');
		
		if(fail[i].errors.length > 0) {	
			msg += '<ul>';
			
			for(var x = 0; x < fail[i].errors.length; x++) {	
				msg += '<li>'+fail[i].errors[x]+'</li>';
			}
			
			msg += '</ul>';
		}
		
		msg += '</li>';
	}
	
	msg += '</ul>';
	msg += '<p><em style="font-size: 11px;">Sent at your request by HTTP-Status-Check running on your NodeJS server.</em></p>';
	
	// Setup email params
	var mailOptions = {
		from: emailData.from.name.first+' '+emailData.from.name.last+' <'+emailData.from.email+'>', // sender address
		to: emailData.locals.name.first+' '+emailData.locals.name.last+' <'+emailData.locals.email+'>', // list of receivers
		subject: 'HTTP Status Check encountered some problems', // Subject line
		//text: 'Hello world ✔', // plaintext body
		html: msg // html body
	};

	// Send email
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
		} else{
			console.log('Message sent: ' + info.response);
		}
	});

};

var done = function() {
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
