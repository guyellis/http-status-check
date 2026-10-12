'use strict';

import nodemailer from 'nodemailer';
import _ from 'lodash';
import createDebug from 'debug';
import bunyan from 'bunyan';
import emailData from './emailSampleData.js';
import type { NormalizedSite } from '../types.js';

var debug = createDebug('http-status-check:emailAdapter');
var log = bunyan.createLogger({
  name: 'http-status-check',
  streams: [{
    path: './httpstatuscheck.log'
  }]
});

var successHits = 0;
var failHits = 0;
var disableHits = 0;

var success: string[] = [];
var fail: Array<{ text: string; errors?: unknown }> = [];
var disabled: string[] = [];

var organizeErrors = function(errors: unknown): string[] {
  var errorList: unknown;
  if (!Array.isArray(errors)) {
    if (_.isObject(errors)) {
      errorList = _.map(errors as Record<string, unknown>, function(value, key) {
        return key + ': ' + value;
      });
    } else {
      errorList = [errors];
    }
  } else {
    errorList = errors;
  }
  return _.flatten(errorList as unknown[]).map(function(item) {
    return String(item);
  });
};

var writeResult = function(
  result: string,
  uri: Partial<NormalizedSite> & { verbose?: boolean; name?: string; requestUrl?: string; errors?: unknown }
): void {
  switch (result) {
    case 'success':
      success.push('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
      successHits++;
      break;
    case 'fail':
      if (uri.errors) {
        uri.errors = organizeErrors(uri.errors);
      }
      fail.push({
        text: 'X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:',
        errors: uri.errors
      });
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

var sendEmail = function(): void {
  var transport = (nodemailer.createTransport as unknown as (service: string, options: unknown) => {
    sendMail(
      options: Record<string, unknown>,
      callback: (err: Error | null, responseStatus?: { message?: string }) => void
    ): void;
  })('SMTP', emailData.transport);
  var html = 'need to define some html';

  transport.sendMail({
    from: emailData.from.name.first + ' ' + emailData.from.name.last + ' <' + emailData.from.email + '>',
    to: emailData.locals.email,
    subject: emailData.subject + ' ' + Date.now().toString(),
    html: html
  }, function(err: Error | null, responseStatus?: { message?: string }) {
    if (err) {
      debug('Error in transport.sendMail():');
      debug(err);
      throw err;
    } else {
      console.log('responseStatus.message: ', responseStatus?.message);
    }
  });
};

var done = function(): void {
  if (failHits > 0) {
    sendEmail();
  }

  log.info('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
  log.info('Failure count: ', failHits);
  log.info('Success count: ', successHits);
  log.info('Disable count: ', disableHits);
};

var getSuccessHits = function(): number {
  return successHits;
};

var getFailHits = function(): number {
  return failHits;
};

var getDisableHits = function(): number {
  return disableHits;
};

var resetHits = function(): void {
  successHits = 0;
  failHits = 0;
  disableHits = 0;
};

var emailAdapter = {
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

export default emailAdapter;
