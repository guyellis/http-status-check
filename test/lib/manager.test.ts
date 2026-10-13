'use strict';

import _ from 'lodash';
import manager from '../../lib/manager.js';
import type { NormalizedSite, Settings, SiteConfig } from '../../lib/types.js';
import uriCheck from '../../lib/uriCheck.js';

describe('lib/manager/', function () {
  describe('run()', function () {
    test('uses 3 as the default concurrentRequests if not supplied', function () {
      let initCalled = false;
      const initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function () {
        initCalled = true;
      });
      let expandRequestUrlInputCalled = false;
      const expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function (
        sites: SiteConfig[],
      ) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      let concurrentRequests = 0;
      const iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function (
        concurrentRequestsParam: number,
      ) {
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({}, {});
      expect(concurrentRequests).toBe(3);
      expect(initCalled).toBe(true);
      expect(expandRequestUrlInputCalled).toBe(true);

      initSpy.mockRestore();
      expandSpy.mockRestore();
      iterateSpy.mockRestore();
    });

    test('uses the number of concurrentRequests supplied', function () {
      let initCalled = false;
      const initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function () {
        initCalled = true;
      });
      let expandRequestUrlInputCalled = false;
      const expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function (
        sites: SiteConfig[],
      ) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      let concurrentRequests = 0;
      const iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function (
        concurrentRequestsParam: number,
      ) {
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({}, { concurrentRequests: 15 });
      expect(concurrentRequests).toBe(15);
      expect(initCalled).toBe(true);
      expect(expandRequestUrlInputCalled).toBe(true);

      initSpy.mockRestore();
      expandSpy.mockRestore();
      iterateSpy.mockRestore();
    });

    test('should use 3 as the number of concurrentRequests if a number less than 1 is supplied', function () {
      let initCalled = false;
      const initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function () {
        initCalled = true;
      });
      let expandRequestUrlInputCalled = false;
      const expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function (
        sites: SiteConfig[],
      ) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      let concurrentRequests = 0;
      const iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function (
        concurrentRequestsParam: number,
      ) {
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({ concurrentRequests: -1 }, {});
      expect(concurrentRequests).toBe(3);
      expect(initCalled).toBe(true);
      expect(expandRequestUrlInputCalled).toBe(true);

      initSpy.mockRestore();
      expandSpy.mockRestore();
      iterateSpy.mockRestore();
    });

    test('propagates verbose flag to allSites and merges allSites defaults into each site', function () {
      let initCalled = false;
      const initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function () {
        initCalled = true;
      });
      let passedSites: NormalizedSite[] = [];
      const iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function (
        _concurrent: number,
        sites: NormalizedSite[],
      ) {
        passedSites = sites;
      });

      const runData = {
        sites: [{ name: 'Site1', requestUrl: 'http://example.com' }],
      };
      const settings: Settings = {
        allSites: {
          requestHeaders: { 'User-Agent': 'TestAgent' },
        },
        concurrentRequests: 5,
      };

      manager.run(runData, settings, undefined, true);

      expect(initCalled).toBe(true);
      expect(settings.allSites?.verbose).toBe(true);
      expect(passedSites.length).toBe(1);
      expect(passedSites[0].verbose).toBe(true);
      expect(passedSites[0].requestHeaders).toEqual({ 'User-Agent': 'TestAgent' });
      expect(passedSites[0].name).toBe('Site1');

      initSpy.mockRestore();
      iterateSpy.mockRestore();
    });
  });

  describe('expandRequestUrlInput()', function () {
    test('expands arrays of requestUrls if they are an array', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          name: 'TestSite',
          requestUrl: ['test1.com', 'test2.com'],
        },
      ];
      const results = manager.expandRequestUrlInput(sites);
      expect(results.length).toBe(2);
      expect(Array.isArray(results)).toBe(true);
    });

    test('does nothing if requestUrls is not an array', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];
      const results = manager.expandRequestUrlInput(sites);
      expect(results.length).toBe(1);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('iterateURLs()', function () {
    test('calls uriCheck.done() when finished', function () {
      const sites: NormalizedSite[] = [
        {
          expectedStatus: 200,
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];
      let checkUriCallCount = 0;
      let doneCallCount = 0;
      const checkSpy = vi.spyOn(uriCheck, 'checkUri').mockImplementation(function (
        site: NormalizedSite,
        callback: (err?: Error | null) => void,
      ) {
        checkUriCallCount++;
        callback();
      });
      const doneSpy = vi.spyOn(uriCheck, 'done').mockImplementation(function () {
        doneCallCount++;
      });

      manager.iterateURLs(3, sites);
      expect(checkUriCallCount).toBe(1);
      expect(doneCallCount).toBe(1);

      checkSpy.mockRestore();
      doneSpy.mockRestore();
    });

    test('throws an error if checkUri calls back with error', function () {
      const sites: NormalizedSite[] = [
        {
          expectedStatus: 200,
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];
      let checkUriCallCount = 0;
      let doneCallCount = 0;
      const checkSpy = vi.spyOn(uriCheck, 'checkUri').mockImplementation(function (
        site: NormalizedSite,
        callback: (err?: Error | null) => void,
      ) {
        checkUriCallCount++;
        callback(new Error('Unit Test Error'));
      });
      const doneSpy = vi.spyOn(uriCheck, 'done').mockImplementation(function () {
        doneCallCount++;
      });

      let exceptionText = '';
      try {
        manager.iterateURLs(3, sites);
      } catch (e: unknown) {
        exceptionText = (e as Error).toString();
      }
      expect(exceptionText).toBe('Error: Unit Test Error');
      expect(checkUriCallCount).toBe(1);
      expect(doneCallCount).toBe(0);

      checkSpy.mockRestore();
      doneSpy.mockRestore();
    });
  });

  describe('expandExpectedTextInput()', function () {
    test('should do nothing if there is no expectedText property', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];

      const results = manager.expandExpectedTextInput(sites);

      expect(results).toBeDefined();
      expect(_.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]?.expectedText).toBeUndefined();
      expect(results[0]?.name).toBe('TestSite');
    });

    test('should expand expectedText property if it is a single string', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          expectedText: 'some search string',
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];

      const results = manager.expandExpectedTextInput(sites);

      expect(results).toBeDefined();
      expect(_.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('TestSite');
      expect(_.isArray(results[0]?.expectedText)).toBe(true);
      expect(results[0]?.expectedText?.length).toBe(1);
      expect(results[0]?.expectedText?.[0]?.text).toBe('some search string');
    });

    test('should expand expectedText property if it is an array of strings and/or objects', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          expectedText: [
            'some search string',
            { text: '2nd string' },
            { caseSensitive: true, text: '3rd string' },
          ],
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];

      const results = manager.expandExpectedTextInput(sites);

      expect(results).toBeDefined();
      expect(_.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('TestSite');
      expect(_.isArray(results[0]?.expectedText)).toBe(true);
      expect(results[0]?.expectedText?.length).toBe(3);
      expect(results[0]?.expectedText?.[0]?.text).toBe('some search string');
      expect(results[0]?.expectedText?.[0]?.caseSensitive).toBeUndefined();
      expect(results[0]?.expectedText?.[1]?.text).toBe('2nd string');
      expect(results[0]?.expectedText?.[1]?.caseSensitive).toBeUndefined();
      expect(results[0]?.expectedText?.[2]?.text).toBe('3rd string');
      expect(results[0]?.expectedText?.[2]?.caseSensitive).toBeDefined();
      expect(results[0]?.expectedText?.[2]?.caseSensitive).toBe(true);
    });

    test('should throw an Error if the expectedText object does not have a text property', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          expectedText: { random: '2nd string' },
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];

      let error: Error | undefined;
      try {
        manager.expandExpectedTextInput(sites);
      } catch (e: unknown) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe('text property is missing from expectedText object.');
    });

    test('should throw an Error if the expectedText object has an unrecognized type', function () {
      const sites: SiteConfig[] = [
        {
          expectedStatus: 200,
          expectedText: true,
          name: 'TestSite',
          requestUrl: 'test1.com',
        },
      ];

      let error: Error | undefined;
      try {
        manager.expandExpectedTextInput(sites);
      } catch (e: unknown) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe('Unknown/Unexpected type for text property.');
    });
  });
});
