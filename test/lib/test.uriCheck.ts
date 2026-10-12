'use strict';

import request from 'request';
import type { NormalizedSite, OutAdapter, SiteConfig } from '../../lib/types.js';
import uriCheck from '../../lib/uriCheck.js';

function checkUriPromise(site: NormalizedSite | SiteConfig): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    uriCheck.checkUri(site as NormalizedSite, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

describe('lib/uriCheck/', function () {
  describe('init()', function () {
    it('sets the outAdapter', function () {
      uriCheck.init({ test: true });
      const outAdapter = uriCheck.getOutAdapter() as { test?: boolean } | undefined;
      expect(outAdapter?.test).toBe(true);
    });
  });

  describe('startsWith()', function () {
    const testString = 'this is a string';
    const startsWith = uriCheck.startsWith;

    it('should return true if the string starts with one of the array items', function () {
      const protocols = ['this', 'is'];
      const result = startsWith(testString, protocols);
      expect(result).toBe(true);
    });

    it('should return false if the string does not start with one of the array items', function () {
      const protocols = ['that', 'is'];
      const result = startsWith(testString, protocols);
      expect(result).toBe(false);
    });
  });

  describe('checkUri()', function () {
    it('should terminate early if the site is disabled', async function () {
      const site: SiteConfig = {
        disabled: true,
        verbose: true,
      };
      let writeResultCallCount = 0;
      const outAdapter: OutAdapter = {
        writeResult: function () {
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);
      const requestSpy = vi.spyOn(request, 'get');

      await checkUriPromise(site);

      expect(requestSpy).not.toHaveBeenCalled();
      expect(writeResultCallCount).toBe(1);
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if request.get() returns an error', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0',
        },
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        if (callback) {
          callback(
            { Error: new Error('Unit Test Error') } as unknown as Error,
            {} as request.Response,
            '',
          );
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if the status lib is not what is expected', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0',
        },
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = {
          headers: {
            location: 'www.newplace.com',
          },
          statusCode: 301,
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if the response headers do not match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        responseHeaders: {
          location: 'http://unittest.com/',
        },
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = {
          headers: {
            location: 'it is not a match',
          },
          statusCode: 301,
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if an excludedHeaders header is present', async function () {
      const site: SiteConfig = {
        excludedHeaders: ['X-Powered-By'],
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = {
          headers: {
            'x-powered-by': 'ASP.NET',
          },
          statusCode: 200,
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if expected case insensitive text is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ text: 'some random text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = { statusCode: 200 } as unknown as request.Response;
        const body = 'this body does not have the random text we are looking for';
        if (callback) {
          callback(null, response, body);
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if expected case-sensitive text is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ caseSensitive: true, text: 'Random Text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = { statusCode: 200 } as unknown as request.Response;
        const body = 'this body does not have the random text we are looking for';
        if (callback) {
          callback(null, response, body);
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with fail if there is expected text and the response body is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ caseSensitive: true, text: 'Random Text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = { statusCode: 200 } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      requestSpy.mockRestore();
    });

    it('should call writeResult with success if the response headers and statuses match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        responseHeaders: {
          location: 'http://unittest.com/',
        },
        verbose: true,
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = {
          headers: {
            location: 'http://unittest.com/',
          },
          statusCode: 301,
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      requestSpy.mockRestore();
    });

    it('should call writeResult with success if the statuses match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        verbose: true,
      };

      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
      ) {
        const response = {
          statusCode: 301,
        } as unknown as request.Response;
        if (callback) {
          callback(null, response, '');
        }
        return {} as request.Request;
      });
      let writeResultCallCount = 0;
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
          writeResultCallCount++;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      requestSpy.mockRestore();
    });

    it('should set followRedirect to true in request options when site.followRedirect is true', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        followRedirect: true,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };
      const outAdapter: OutAdapter = {
        writeResult: vi.fn(),
      };
      uriCheck.init(outAdapter);
      let capturedOptions: (request.RequiredUriUrl & request.CoreOptions) | undefined;
      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
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
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };
      const outAdapter: OutAdapter = {
        writeResult: vi.fn(),
      };
      uriCheck.init(outAdapter);
      let capturedOptions: (request.RequiredUriUrl & request.CoreOptions) | undefined;
      const requestSpy = vi.spyOn(request, 'get').mockImplementation(function (
        options: request.RequiredUriUrl & request.CoreOptions,
        callback?: request.RequestCallback,
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
      let doneCallCount = 0;
      const outAdapter: OutAdapter = {
        done: function () {
          doneCallCount++;
        },
      };
      uriCheck.init(outAdapter);
      uriCheck.done();

      expect(doneCallCount).toBe(1);
    });
  });
});
