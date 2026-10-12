'use strict';

import createDebug from 'debug';
import _ from 'lodash';
import type { ExpectedTextObject, NormalizedSite, OutAdapter } from './types.js';

const debug = createDebug('http-status-check:uriCheck');
let outAdapter: OutAdapter | undefined;

const init = function (output?: OutAdapter): void {
  outAdapter = output;
};

function startsWith(testString: string, protocols: string[]): boolean {
  for (let i = 0, n = protocols.length; i < n; i++) {
    if (testString.toLowerCase().startsWith(protocols[i].toLowerCase())) {
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
  accumulatedFails: string[],
): void {
  if (!site.responseHeaders) {
    return;
  }

  for (const header in site.responseHeaders) {
    if (Object.prototype.hasOwnProperty.call(site.responseHeaders, header)) {
      const actualHeaderValue = response.headers[header] ?? response.headers[header.toLowerCase()];
      const expectedHeaderValue = site.responseHeaders[header];
      if (actualHeaderValue !== expectedHeaderValue) {
        accumulatedFails.push(
          "Expected header '" +
            header +
            "' to be " +
            expectedHeaderValue +
            ' but instead it was ' +
            actualHeaderValue,
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
  accumulatedFails: string[],
): void {
  if (!site.excludedHeaders) {
    return;
  }

  _.each(site.excludedHeaders, function (header) {
    header = header.toLowerCase();
    if (response.headers[header]) {
      const headerValue = response.headers[header];
      accumulatedFails.push(
        "Expected header '" + header + "' to NOT be present but it is set to: " + headerValue,
      );
    }
  });
}

// expectedText is not empty then check that the expected text is in
// the response body received back from server.
function checkBody(
  site: NormalizedSite,
  body: string | undefined,
  accumulatedFails: string[],
): void {
  if (!site.expectedText) {
    return;
  }

  if (!body) {
    accumulatedFails.push('Expected a response body from the request but it was empty.');
    return;
  }

  let lowerCaseBody: string | undefined;
  _.forEach(site.expectedText, function (textObj: ExpectedTextObject) {
    if (textObj.caseSensitive) {
      if (body.indexOf(textObj.text) === -1) {
        accumulatedFails.push(
          'Expected (case sensitive) text in response body not found: ' + textObj.text,
        );
      }
    } else {
      if (!lowerCaseBody) {
        lowerCaseBody = body.toLowerCase();
      }
      if (lowerCaseBody.indexOf(textObj.text.toLowerCase()) === -1) {
        accumulatedFails.push(
          'Expected (case insensitive) text in response body not found: ' +
            textObj.text.toLowerCase(),
        );
      }
    }
  });
}

const checkUri = function (site: NormalizedSite, callback: (err?: Error | null) => void): void {
  if (site.disabled) {
    outAdapter?.writeResult?.('disabled', site);
    return callback(null);
  }

  let uri = site.requestUrl;
  // Check that uri has a protocol
  if (!startsWith(uri, ['http://', 'https://'])) {
    uri = 'http://' + uri;
  }

  const options: RequestInit = {
    headers: site.requestHeaders,
    redirect: site.followRedirect ? 'follow' : 'manual',
  };

  fetch(uri, options)
    .then(async function (response) {
      const body = await response.text();

      if (response.status !== site.expectedStatus) {
        let err =
          'Expected HTTP status of ' + site.expectedStatus + ' and got ' + response.status + '.';
        if (response.status >= 300 && response.status < 400) {
          // Some type of redirect. Let's add the location to the error result to help the user
          // determine what the problem is.
          const location = response.headers.get('location');
          if (location) {
            err += ' Location: ' + location;
          }
        }
        site.errors = [err];
        outAdapter?.writeResult?.('fail', site);
        return callback(null);
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach(function (value, key) {
        responseHeaders[key.toLowerCase()] = value;
      });

      const accumulatedFails: string[] = [];

      // If responseHeaders is not empty then evaluate that they all have the
      // expected values.
      checkHeaders(site, { headers: responseHeaders }, accumulatedFails);

      // If excludedHeaders is not empty then ensure that none of them have been
      // returned by the server.
      checkExcludedHeaders(site, { headers: responseHeaders }, accumulatedFails);

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
    })
    .catch(function (error: unknown) {
      debug('error in fetch:');
      debug(error);
      site.errors = error;
      outAdapter?.writeResult?.('fail', site);
      return callback(null);
    });
};

const done = function (): void {
  outAdapter?.done?.();
};

const getOutAdapter = function (): OutAdapter | undefined {
  return outAdapter;
};

const uriCheck = {
  checkUri: checkUri,
  done: done,
  getOutAdapter: getOutAdapter,
  init: init,
  startsWith: startsWith,
};

export { done, checkUri, init, startsWith, getOutAdapter };

export default uriCheck;
