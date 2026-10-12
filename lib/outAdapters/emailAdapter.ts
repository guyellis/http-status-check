'use strict';

import createDebug from 'debug';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import type { NormalizedSite } from '../types.js';
import emailData from './emailSampleData.js';

const debug = createDebug('http-status-check:emailAdapter');

let successHits = 0;
let failHits = 0;
let disableHits = 0;

const success: string[] = [];
const fail: Array<{ text: string; errors?: unknown }> = [];
const disabled: string[] = [];

const organizeErrors = function (errors: unknown): string[] {
  let errorList: unknown;
  if (!Array.isArray(errors)) {
    if (_.isObject(errors)) {
      errorList = _.map(errors as Record<string, unknown>, function (value, key) {
        return key + ': ' + value;
      });
    } else {
      errorList = [errors];
    }
  } else {
    errorList = errors;
  }
  return _.flatten(errorList as unknown[]).map(function (item) {
    return String(item);
  });
};

const writeResult = function (
  result: string,
  uri: Partial<NormalizedSite> & {
    verbose?: boolean;
    name?: string;
    requestUrl?: string;
    errors?: unknown;
  },
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
        errors: uri.errors,
        text: 'X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:',
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

const sendEmail = function (): void {
  const transport = (
    nodemailer.createTransport as unknown as (
      service: string,
      options: unknown,
    ) => {
      sendMail(
        options: Record<string, unknown>,
        callback: (err: Error | null, responseStatus?: { message?: string }) => void,
      ): void;
    }
  )('SMTP', emailData.transport);
  const html = 'need to define some html';

  transport.sendMail(
    {
      from:
        emailData.from.name.first +
        ' ' +
        emailData.from.name.last +
        ' <' +
        emailData.from.email +
        '>',
      html: html,
      subject: emailData.subject + ' ' + Date.now().toString(),
      to: emailData.locals.email,
    },
    function (err: Error | null, responseStatus?: { message?: string }) {
      if (err) {
        debug('Error in transport.sendMail():');
        debug(err);
        throw err;
      } else {
        debug('responseStatus.message: ', responseStatus?.message);
      }
    },
  );
};

const done = function (): void {
  if (failHits > 0) {
    sendEmail();
  }

  debug('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
  debug('Failure count: ', failHits);
  debug('Success count: ', successHits);
  debug('Disable count: ', disableHits);
};

const getSuccessHits = function (): number {
  return successHits;
};

const getFailHits = function (): number {
  return failHits;
};

const getDisableHits = function (): number {
  return disableHits;
};

const resetHits = function (): void {
  successHits = 0;
  failHits = 0;
  disableHits = 0;
};

const emailAdapter = {
  done: done,
  getDisableHits: getDisableHits,
  getFailHits: getFailHits,
  getSuccessHits: getSuccessHits,
  organizeErrors: organizeErrors,
  resetHits: resetHits,
  writeResult: writeResult,
};

export {
  writeResult,
  done,
  organizeErrors,
  getSuccessHits,
  getFailHits,
  getDisableHits,
  resetHits,
};

export default emailAdapter;
