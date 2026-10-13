'use strict';

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
    test('sets the outAdapter', function () {
      uriCheck.init({ test: true });
      const outAdapter = uriCheck.getOutAdapter() as { test?: boolean } | undefined;
      expect(outAdapter?.test).toBe(true);
    });
  });

  describe('startsWith()', function () {
    const testString = 'this is a string';
    const startsWith = uriCheck.startsWith;

    test('should return true if the string starts with one of the array items', function () {
      const protocols = ['this', 'is'];
      const result = startsWith(testString, protocols);
      expect(result).toBe(true);
    });

    test('should return false if the string does not start with one of the array items', function () {
      const protocols = ['that', 'is'];
      const result = startsWith(testString, protocols);
      expect(result).toBe(false);
    });
  });

  describe('checkUri()', function () {
    test('should terminate early if the site is disabled', async function () {
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
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      await checkUriPromise(site);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(writeResultCallCount).toBe(1);
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if fetch() returns an error', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0',
        },
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockRejectedValue(new Error('Unit Test Error'));
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if the status lib is not what is expected', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestHeaders: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0',
        },
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          headers: {
            location: 'www.newplace.com',
          },
          status: 301,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if the response headers do not match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        responseHeaders: {
          location: 'http://unittest.com/',
        },
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          headers: {
            location: 'it is not a match',
          },
          status: 301,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if an excludedHeaders header is present', async function () {
      const site: SiteConfig = {
        excludedHeaders: ['X-Powered-By'],
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          headers: {
            'x-powered-by': 'ASP.NET',
          },
          status: 200,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if expected case insensitive text is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ text: 'some random text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('this body does not have the random text we are looking for', {
          status: 200,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if expected case-sensitive text is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ caseSensitive: true, text: 'Random Text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('this body does not have the random text we are looking for', {
          status: 200,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if there is expected text and the response body is missing', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [{ caseSensitive: true, text: 'Random Text' }],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          status: 200,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with success if the response headers and statuses match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        responseHeaders: {
          location: 'http://unittest.com/',
        },
        verbose: true,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          headers: {
            location: 'http://unittest.com/',
          },
          status: 301,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with success if the statuses match', async function () {
      const site: SiteConfig = {
        expectedStatus: 301,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        verbose: true,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          status: 301,
        }),
      );
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

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultCallCount).toBe(1);
      expect(writeResultResult).toBe('success');
      fetchSpy.mockRestore();
    });

    test('should set redirect to follow in fetch options when site.followRedirect is true', async function () {
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
      let capturedOptions: RequestInit | undefined;
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(function (
        _input: RequestInfo | URL,
        init?: RequestInit,
      ) {
        capturedOptions = init;
        return Promise.resolve(new Response('', { status: 200 }));
      });

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions?.redirect).toBe('follow');
      expect(outAdapter.writeResult).toHaveBeenCalledWith('success', site);
      fetchSpy.mockRestore();
    });

    test('should set redirect to manual in fetch options when site.followRedirect is not provided', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };
      const outAdapter: OutAdapter = {
        writeResult: vi.fn(),
      };
      uriCheck.init(outAdapter);
      let capturedOptions: RequestInit | undefined;
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(function (
        _input: RequestInfo | URL,
        init?: RequestInit,
      ) {
        capturedOptions = init;
        return Promise.resolve(new Response('', { status: 200 }));
      });

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions?.redirect).toBe('manual');
      expect(outAdapter.writeResult).toHaveBeenCalledWith('success', site);
      fetchSpy.mockRestore();
    });

    test('should prepend http:// to uri when missing protocol and pass requestHeaders', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestHeaders: {
          'X-Custom-Header': 'custom-val',
        },
        requestUrl: 'www.unittest.com',
      };
      const outAdapter: OutAdapter = {
        writeResult: vi.fn(),
      };
      uriCheck.init(outAdapter);
      let capturedUri: RequestInfo | URL | undefined;
      let capturedOptions: RequestInit | undefined;
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(function (
        input: RequestInfo | URL,
        init?: RequestInit,
      ) {
        capturedUri = input;
        capturedOptions = init;
        return Promise.resolve(new Response('', { status: 200 }));
      });

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(capturedUri).toBe('http://www.unittest.com');
      expect(capturedOptions?.headers).toEqual({ 'X-Custom-Header': 'custom-val' });
      expect(outAdapter.writeResult).toHaveBeenCalledWith('success', site);
      fetchSpy.mockRestore();
    });

    test('should not prepend protocol if already https://', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'https://www.unittest.com',
      };
      const outAdapter: OutAdapter = {
        writeResult: vi.fn(),
      };
      uriCheck.init(outAdapter);
      let capturedUri: RequestInfo | URL | undefined;
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(function (
        input: RequestInfo | URL,
      ) {
        capturedUri = input;
        return Promise.resolve(new Response('', { status: 200 }));
      });

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(capturedUri).toBe('https://www.unittest.com');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if the status does not match and is not a redirect', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          status: 404,
        }),
      );
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string, resSite: NormalizedSite | Record<string, unknown>) {
          writeResultResult = result;
          expect((resSite as NormalizedSite).errors).toEqual([
            'Expected HTTP status of 200 and got 404.',
          ]);
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with fail if redirect status has no location header', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          status: 301,
        }),
      );
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string, resSite: NormalizedSite | Record<string, unknown>) {
          writeResultResult = result;
          expect((resSite as NormalizedSite).errors).toEqual([
            'Expected HTTP status of 200 and got 301.',
          ]);
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultResult).toBe('fail');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with success if excludedHeaders are not present in response', async function () {
      const site: SiteConfig = {
        excludedHeaders: ['X-Powered-By'],
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('', {
          headers: {
            'content-type': 'text/html',
          },
          status: 200,
        }),
      );
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultResult).toBe('success');
      fetchSpy.mockRestore();
    });

    test('should call writeResult with success when multiple expected texts (case-sensitive and case-insensitive) are found', async function () {
      const site: SiteConfig = {
        expectedStatus: 200,
        expectedText: [
          { caseSensitive: true, text: 'Hello World' },
          { caseSensitive: false, text: 'FOO' },
          { caseSensitive: false, text: 'BAR' },
        ],
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Hello World foo bar baz', {
          status: 200,
        }),
      );
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultResult).toBe('success');
      fetchSpy.mockRestore();
    });

    test('should ignore inherited responseHeaders and match mixed-case expected headers via lowercase lookup', async function () {
      const protoHeaders = { inheritedHeader: 'should-be-ignored' };
      const responseHeaders = Object.create(protoHeaders);
      responseHeaders['Content-Type'] = 'application/json';

      const site: SiteConfig = {
        expectedStatus: 200,
        name: 'Unit Test',
        requestUrl: 'www.unittest.com',
        responseHeaders: responseHeaders,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', {
          headers: {
            'content-type': 'application/json',
          },
          status: 200,
        }),
      );
      let writeResultResult = '';
      const outAdapter: OutAdapter = {
        writeResult: function (result: string) {
          writeResultResult = result;
        },
      };
      uriCheck.init(outAdapter);

      await checkUriPromise(site);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(writeResultResult).toBe('success');
      fetchSpy.mockRestore();
    });
  });

  describe('done()', function () {
    test('should call the outAdapters done method', function () {
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
