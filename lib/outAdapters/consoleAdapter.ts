'use strict';

import _ from 'lodash';
import type { NormalizedSite } from '../types.js';

let successHits = 0;
let failHits = 0;
let disableHits = 0;

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
      if (uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
      }
      successHits++;
      break;
    case 'fail':
      console.log('X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:');
      if (uri.errors) {
        const formattedErrors = organizeErrors(uri.errors);
        _.forEach(formattedErrors, function (error) {
          console.log('  - ' + error);
        });
      }
      failHits++;
      break;
    case 'disabled':
      if (uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') testing disabled.');
      }
      disableHits++;
      break;
    default:
      throw new Error('unknown case statement: ' + result);
  }
};

const done = function (): void {
  console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
  console.log('Failure count: ', failHits);
  console.log('Success count: ', successHits);
  console.log('Disable count: ', disableHits);
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

const consoleAdapter = {
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

export default consoleAdapter;
