'use strict';

import request from 'request';
import uriCheck from '../../lib/uriCheck.js';
import type { NormalizedSite, OutAdapter, SiteConfig } from '../../lib/types.js';

function checkUriPromise(site: NormalizedSite | SiteConfig): Promise<void> {
  return new Promise<void>(function(resolve, reject) {
    uriCheck.checkUri(site as NormalizedSite, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

describe('lib/uriCheck/', function() {
  describe('init()', function () {
    it('sets the outAdapter', function () {
      uriCheck.init({ test: true });
      var outAdapter = uriCheck.getOutAdapter() as { test?: boolean } | undefined;
      expect(outAdapter?.test).toBe(true);
    });
  });

  describe('startsWith()', function () {
    var testString = 'this is a string';
    var startsWith = uriCheck.startsWith;

    it('should return true if the string starts with one of the array items', function () {
      var protocols = ['this', 'is'];
      var result = startsWith(testString, protocols);
      expect(result).toBe(true);
    });

    it('should return false if the string does not start with one of the array items', function () {
      var protocols = ['that', 'is'];
      var result = startsWith(testString, protocols);
      expect(result).toBe(false);
    });
  });

  describe('checkUri()', function () {
    it('should terminate early if the site is disabled', async function () {
      var site: SiteConfig = {
        disabled: true,
        verbose: true
      };
      var writeResultCallCount = 0;
      var outAdapter: OutAdapter = {
        writeResult: function() {
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);
      var requestSpy = vi.spyOn(request, 'get');

      await checkUriPromise(site);

      expect(requestSpy).not.toHaveBeenCalled();
      expect(writeResultCallCount).toBe(1);
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if request.get() returns an error', async function () {
      var site: SiteConfig = {
        'name': 'Unit Test',
        'expectedStatus': 200,
        'requestUrl': 'www.unittest.com',
        'requestHeaders': {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0'
        }
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        if (callback) {
          callback({ Error: new Error('Unit Test Error') } as unknown as Error, {} as request.Response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if the status lib is not what is expected', async function () {
      var site: SiteConfig = {
        'name': 'Unit Test',
        'expectedStatus': 200,
        'requestUrl': 'www.unittest.com',
        'requestHeaders': {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0'
        }
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = {
          statusCode: 301,
          headers: {
            location: 'www.newplace.com'
          }
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if the response headers do not match', async function () {
      var site: SiteConfig = {
        'name': 'Unit Test',
        'expectedStatus': 301,
        'requestUrl': 'www.unittest.com',
        'responseHeaders': {
          'location': 'http://unittest.com/'
        }
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = {
          statusCode: 301,
          headers: {
            'location': 'it is not a match'
          }
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if an excludedHeaders header is present', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com',
        excludedHeaders: ['X-Powered-By']
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = {
          statusCode: 200,
          headers: {
            'x-powered-by': 'ASP.NET'
          }
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if expected case insensitive text is missing', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com',
        expectedText: [{ text: 'some random text' }]
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = { statusCode: 200 } as unknown as request.Response;
        var body = 'this body does not have the random text we are looking for';
        if (callback) {
          callback(null, response, body);
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if expected case-sensitive text is missing', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com',
        expectedText: [{ text: 'Random Text', caseSensitive: true }]
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = { statusCode: 200 } as unknown as request.Response;
        var body = 'this body does not have the random text we are looking for';
        if (callback) {
          callback(null, response, body);
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if there is expected text and the response body is missing', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com',
        expectedText: [{ text: 'Random Text', caseSensitive: true }]
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = { statusCode: 200 } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with success if the response headers and statuses match', async function () {
      var site: SiteConfig = {
        'name': 'Unit Test',
        'expectedStatus': 301,
        'requestUrl': 'www.unittest.com',
        'responseHeaders': {
          'location': 'http://unittest.com/'
        },
        verbose: true
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = {
          statusCode: 301,
          headers: {
            'location': 'http://unittest.com/'
          }
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      requestSpy.mockRestore();
    });

    it('should call writeResult with success if the statuses match', async function () {
      var site: SiteConfig = {
        'name': 'Unit Test',
        'expectedStatus': 301,
        'requestUrl': 'www.unittest.com',
        verbose: true
      };

      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        var response = {
          statusCode: 301
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      var outAdapter: OutAdapter = {
        writeResult: function(result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      requestSpy.mockRestore();
    });

    it('should set followRedirect to true in request options when site.followRedirect is true', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com',
        followRedirect: true
      };
      var outAdapter: OutAdapter = {
        writeResult: vi.fn()
      };
      uriCheck.init(outAdapter);
      var capturedOptions: (request.RequiredUriUrl & request.CoreOptions) | undefined;
      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        capturedOptions = options;
        if (callback) {
          callback(null, { statusCode: 200 } as unknown as request.Response, '');
        }
        return {} as request.Request;
      });

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions?.followRedirect).toBe(true);
      expect(outAdapter.writeResult).toHaveBeenCalledWith('success', site);
      requestSpy.mockRestore();
    });

    it('should set followRedirect to false in request options when site.followRedirect is not provided', async function () {
      var site: SiteConfig = {
        name: 'Unit Test',
        expectedStatus: 200,
        requestUrl: 'www.unittest.com'
      };
      var outAdapter: OutAdapter = {
        writeResult: vi.fn()
      };
      uriCheck.init(outAdapter);
      var capturedOptions: (request.RequiredUriUrl & request.CoreOptions) | undefined;
      var requestSpy = vi.spyOn(request, 'get').mockImplementation(function(
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback
      ) {
        capturedOptions = options;
        if (callback) {
          callback(null, { statusCode: 200 } as unknown as request.Response, '');
        }
        return {} as request.Request;
      });

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions?.followRedirect).toBe(false);
      expect(outAdapter.writeResult).toHaveBeenCalledWith('success', site);
      requestSpy.mockRestore();
    });
  });

  describe('done()', function () {
    it('should call the outAdapters done method', function () {
      var doneCallCount = 0;
      var outAdapter: OutAdapter = {
        done: function () {
          doneCallCount++;
        }
      };
      uriCheck.init(outAdapter);
      uriCheck.done();

      expect(doneCallCount).toBe(1);
    });
  });

});
