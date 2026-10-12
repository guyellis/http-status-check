'use strict';

import _ from 'lodash';
import request from 'request';
import createDebug from 'debug';
import S from 'string';
import 'sugar';
import type { ExpectedTextObject, NormalizedSite, OutAdapter } from './types.js';

var debug = createDebug('http-status-check:uriCheck');
var outAdapter: OutAdapter | undefined;

var init = function(output?: OutAdapter): void {
  outAdapter = output;
};

function startsWith(testString: string, protocols: string[]): boolean {
  for (var i = 0, n = protocols.length; i < n; i++) {
    if (S(testString.toLowerCase()).startsWith(protocols[i].toLowerCase())) {
      return true;
    }
  }
  return false;
}

// If responseHeaders is not empty then evaluate that they all have the
// expected values.
function checkHeaders(
  site: NormalizedSite,
  response: { headers: Record<string, string | string[] | undefined> },
  accumulatedFails: string[]
): void {
  if (!site.responseHeaders) {
    return;
  }

  for (var header in site.responseHeaders) {
    if (Object.prototype.hasOwnProperty.call(site.responseHeaders, header)) {
      var actualHeaderValue = response.headers[header];
      var expectedHeaderValue = site.responseHeaders[header];
      if (actualHeaderValue !== expectedHeaderValue) {
        accumulatedFails.push(
          'Expected header \'' + header + '\' to be ' +
            expectedHeaderValue + ' but instead it was ' +
            actualHeaderValue
        );
      }
    }
  }
}

// If excludedHeaders is not empty then ensure that none of them have been
// returned by the server.
function checkExcludedHeaders(
  site: NormalizedSite,
  response: { headers: Record<string, string | string[] | undefined> },
  accumulatedFails: string[]
): void {
  if (!site.excludedHeaders) {
    return;
  }

  _.each(site.excludedHeaders, function(header) {
    header = header.toLowerCase();
    if (response.headers[header]) {
      var headerValue = response.headers[header];
      accumulatedFails.push(
        'Expected header \'' + header +
        '\' to NOT be present but it is set to: ' +
        headerValue
      );
    }
  });
}

// expectedText is not empty then check that the expected text is in
// the response body received back from server.
function checkBody(
  site: NormalizedSite,
  body: string | undefined,
  accumulatedFails: string[]
): void {
  if (!site.expectedText) {
    return;
  }

  if (!body) {
    accumulatedFails.push('Expected a response body from the request but it was empty.');
    return;
  }

  var lowerCaseBody: string | undefined;
  _.forEach(site.expectedText, function(textObj: ExpectedTextObject) {
    if (textObj.caseSensitive) {
      if (body.indexOf(textObj.text) === -1) {
        accumulatedFails.push(
          'Expected (case sensitive) text in response body not found: ' +
          textObj.text
        );
      }
    } else {
      if (!lowerCaseBody) {
        lowerCaseBody = body.toLowerCase();
      }
      if (lowerCaseBody.indexOf(textObj.text.toLowerCase()) === -1) {
        accumulatedFails.push(
          'Expected (case insensitive) text in response body not found: ' +
          textObj.text.toLowerCase()
        );
      }
    }
  });
}

var checkUri = function(site: NormalizedSite, callback: (err?: Error | null) => void): void {
  if (site.disabled) {
    outAdapter?.writeResult?.('disabled', site);
    return callback(null);
  }

  var options: {
    followRedirect: boolean;
    uri: string;
    headers?: Record<string, string>;
  } = {
    followRedirect: !!site.followRedirect,
    uri: site.requestUrl
  };
  // Check that uri has a protocol
  if (!startsWith(options.uri, ['http://', 'https://'])) {
    options.uri = 'http://' + options.uri;
  }

  if (site.requestHeaders) {
    options.headers = site.requestHeaders;
  }

  request.get(options, function(error, response, body) {
    if (error) {
      debug('error in request GET:');
      debug(error);
      site.errors = error;
      outAdapter?.writeResult?.('fail', site);
      return callback(null);
    }

    if (response.statusCode !== site.expectedStatus) {
      var err = 'Expected HTTP status of ' + site.expectedStatus + ' and got ' + response.statusCode + '.';
      if (response.statusCode >= 300 && response.statusCode < 400) {
        // Some type of redirect. Let's add the location to the error result to help the user
        // determine what the problem is.
        if (response.headers && response.headers.location) {
          err += ' Location: ' + response.headers.location;
        }
      }
      site.errors = [err];
      outAdapter?.writeResult?.('fail', site);
      return callback(null);
    }

    var accumulatedFails: string[] = [];

    // If responseHeaders is not empty then evaluate that they all have the
    // expected values.
    checkHeaders(site, response, accumulatedFails);

    // If excludedHeaders is not empty then ensure that none of them have been
    // returned by the server.
    checkExcludedHeaders(site, response, accumulatedFails);

    // expectedText is not empty then check that the expected text is in
    // the response body received back from server.
    checkBody(site, body, accumulatedFails);

    if (accumulatedFails.length === 0) {
      outAdapter?.writeResult?.('success', site);
      return callback(null);
    } else {
      site.errors = accumulatedFails;
      outAdapter?.writeResult?.('fail', site);
      return callback(null);
    }
  });
};

var done = function(): void {
  outAdapter?.done?.();
};

var getOutAdapter = function(): OutAdapter | undefined {
  return outAdapter;
};

var uriCheck = {
  done: done,
  checkUri: checkUri,
  init: init,
  startsWith: startsWith,
  getOutAdapter: getOutAdapter
};

export {
  done,
  checkUri,
  init,
  startsWith,
  getOutAdapter
};

export default uriCheck;
