'use strict';

import _ from 'lodash';
import type { NormalizedSite } from '../types.js';

var successHits = 0;
var failHits = 0;
var disableHits = 0;

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
      if (uri.verbose) {
        console.log('_ ' + uri.name + ' (' + uri.requestUrl + ') working as expected.');
      }
      successHits++;
      break;
    case 'fail':
      console.log('X ' + uri.name + ' (' + uri.requestUrl + ') failed. Here are the problems:');
      if (uri.errors) {
        var formattedErrors = organizeErrors(uri.errors);
        _.forEach(formattedErrors, function(error) {
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

var done = function(): void {
  console.log('A total of ' + (successHits + failHits + disableHits) + ' URIs were tested.');
  console.log('Failure count: ', failHits);
  console.log('Success count: ', successHits);
  console.log('Disable count: ', disableHits);
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
