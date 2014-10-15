'use strict';

var _ = require('lodash');
var request = require('request');
var debug = require('debug')('http-status-check:uriCheck');
require('sugar');
var outAdapter;

var init = function(output){
  outAdapter = output;
};

function startsWith(testString, protocols) {
  for(var i= 0,n=protocols.length; i<n; i++) {
    if(testString.toLowerCase().startsWith(protocols[i].toLowerCase())) {
      return true;
    }
  }
  return false;
}

var checkUri = function(site, callback) {
  if (site.disabled) {
    outAdapter.writeResult('disabled', site);
    return callback(null);
  }

  var options = {
    // TODO: Add unit tests for this. Need to use sinon to mock a response for request.
    followRedirect: !!site.followRedirect,
    uri: site.requestUrl
  };
  // Check that uri has a protocol
  if(!startsWith(options.uri,['http://','https://']))
  {
    options.uri = 'http://' + options.uri;
  }

  if(site.requestHeaders) {
    options.headers = site.requestHeaders;
  }

  request.get(options, function(error, response, body) {
    if(error) {
      debug('error in request GET:');
      debug(error);
      site.errors = error;
      outAdapter.writeResult('fail', site);
      return callback(null);
    } else {
      if(response.statusCode !== site.expectedStatus) {
        var err = 'Expected HTTP status of ' + site.expectedStatus + ' and got ' + response.statusCode + '.';
        if(response.statusCode >= 300 && response.statusCode < 400) {
          // Some type of redirect. Let's add the location to the error result to help the user
          // determine what the problem is.
          if(response.headers && response.headers.location) {
            err += ' Location: ' + response.headers.location;
          }
        }
        site.errors = [err];
        outAdapter.writeResult('fail', site);
        return callback(null);
      } else {

        var accumulatedFails = [];

        // If responseHeaders is not empty then evaluate that they all have the
        // expected values.
        if(site.responseHeaders) {
          for (var header in site.responseHeaders) {
            if (site.responseHeaders.hasOwnProperty(header)) {
              var actualHeaderValue = response.headers[header];
              var expectedHeaderValue = site.responseHeaders[header];
              if(actualHeaderValue !== expectedHeaderValue) {
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
        if(site.excludedHeaders) {
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
        if(site.expectedText) {
          if(body) {
            var lowerCaseBody; // Don't populate it until we need it.
            _.forEach(site.expectedText, function (textObj) {
              if (textObj.caseSensitive) {
                if (body.indexOf(textObj.text) === -1){
                  accumulatedFails.push(
                    'Expected (case sensitive) text in response body not found: ' +
                    textObj.text
                  );
                }
              } else {
                if(!lowerCaseBody) {
                  lowerCaseBody = body.toLowerCase();
                }
                if(lowerCaseBody.indexOf(textObj.text.toLowerCase()) === -1) {
                  accumulatedFails.push(
                    'Expected (case insensitive) text in response body not found: ' +
                    textObj.text.toLowerCase()
                  );
                }
              }
            });
          } else {
            accumulatedFails.push('Expected a response body from the request but it was empty.');
          }
        }

        if(accumulatedFails.length === 0) {
          outAdapter.writeResult('success', site);
          return callback(null);
        } else {
          site.errors = accumulatedFails;
          outAdapter.writeResult('fail', site);
          return callback(null);
        }
      }
    }
  });
};

var done = function() {
  outAdapter.done();
};

module.exports = {
  done: done,
  checkUri: checkUri,
  init: init
};
