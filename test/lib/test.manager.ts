'use strict';

import _ from 'lodash';
import manager from '../../lib/manager.js';
import uriCheck from '../../lib/uriCheck.js';
import type { NormalizedSite, SiteConfig } from '../../lib/types.js';

describe('lib/manager/', function() {
  describe('run()', function () {
    it('uses 3 as the default concurrentRequests if not supplied', function () {
      var initCalled = false;
      var initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function() {
        initCalled = true;
      });
      var expandRequestUrlInputCalled = false;
      var expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function(sites: SiteConfig[]) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      var concurrentRequests = 0;
      var iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function(concurrentRequestsParam: number) {
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

    it('uses the number of concurrentRequests supplied', function () {
      var initCalled = false;
      var initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function() {
        initCalled = true;
      });
      var expandRequestUrlInputCalled = false;
      var expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function(sites: SiteConfig[]) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      var concurrentRequests = 0;
      var iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function(concurrentRequestsParam: number) {
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

    it('should use 3 as the number of concurrentRequests if a number less than 1 is supplied', function () {
      var initCalled = false;
      var initSpy = vi.spyOn(uriCheck, 'init').mockImplementation(function() {
        initCalled = true;
      });
      var expandRequestUrlInputCalled = false;
      var expandSpy = vi.spyOn(manager, 'expandRequestUrlInput').mockImplementation(function(sites: SiteConfig[]) {
        expandRequestUrlInputCalled = true;
        return sites || [];
      });
      var concurrentRequests = 0;
      var iterateSpy = vi.spyOn(manager, 'iterateURLs').mockImplementation(function(concurrentRequestsParam: number) {
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
  });

  describe('expandRequestUrlInput()', function () {
    it('expands arrays of requestUrls if they are an array', function () {
      var sites: SiteConfig[] = [
        {
          'name': 'TestSite',
          'expectedStatus': 200,
          'requestUrl': ['test1.com', 'test2.com']
        }];
      var results = manager.expandRequestUrlInput(sites);
      expect(results.length).toBe(2);
      expect(Array.isArray(results)).toBe(true);
    });

    it('does nothing if requestUrls is not an array', function () {
      var sites: SiteConfig[] = [
        {
          'name': 'TestSite',
          'expectedStatus': 200,
          'requestUrl': 'test1.com'
        }];
      var results = manager.expandRequestUrlInput(sites);
      expect(results.length).toBe(1);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('iterateURLs()', function () {
    it('calls uriCheck.done() when finished', function () {
      var sites: NormalizedSite[] = [
        {
          'name': 'TestSite',
          'expectedStatus': 200,
          'requestUrl': 'test1.com'
        }];
      var checkUriCallCount = 0;
      var doneCallCount = 0;
      var checkSpy = vi.spyOn(uriCheck, 'checkUri').mockImplementation(function(site: NormalizedSite, callback: (err?: Error | null) => void) {
        checkUriCallCount++;
        callback();
      });
      var doneSpy = vi.spyOn(uriCheck, 'done').mockImplementation(function() {
        doneCallCount++;
      });

      manager.iterateURLs(3, sites);
      expect(checkUriCallCount).toBe(1);
      expect(doneCallCount).toBe(1);

      checkSpy.mockRestore();
      doneSpy.mockRestore();
    });

    it('throws an error if checkUri calls back with error', function () {
      var sites: NormalizedSite[] = [
        {
          'name': 'TestSite',
          'expectedStatus': 200,
          'requestUrl': 'test1.com'
        }];
      var checkUriCallCount = 0;
      var doneCallCount = 0;
      var checkSpy = vi.spyOn(uriCheck, 'checkUri').mockImplementation(function(site: NormalizedSite, callback: (err?: Error | null) => void) {
        checkUriCallCount++;
        callback(new Error('Unit Test Error'));
      });
      var doneSpy = vi.spyOn(uriCheck, 'done').mockImplementation(function() {
        doneCallCount++;
      });

      var exceptionText = '';
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
    it('should do nothing if there is no expectedText property', function () {
      var sites: SiteConfig[] = [
        {
          name: 'TestSite',
          expectedStatus: 200,
          requestUrl: 'test1.com'
        }];

      var results = manager.expandExpectedTextInput(sites);

      expect(results).toBeDefined();
      expect(_.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]?.expectedText).toBeUndefined();
      expect(results[0]?.name).toBe('TestSite');
    });

    it('should expand expectedText property if it is a single string', function () {
      var sites: SiteConfig[] = [
        {
          name: 'TestSite',
          expectedStatus: 200,
          requestUrl: 'test1.com',
          expectedText: 'some search string'
        }];

      var results = manager.expandExpectedTextInput(sites);

      expect(results).toBeDefined();
      expect(_.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]?.name).toBe('TestSite');
      expect(_.isArray(results[0]?.expectedText)).toBe(true);
      expect(results[0]?.expectedText?.length).toBe(1);
      expect(results[0]?.expectedText?.[0]?.text).toBe('some search string');
    });

    it('should expand expectedText property if it is an array of strings and/or objects', function () {
      var sites: SiteConfig[] = [
        {
          name: 'TestSite',
          expectedStatus: 200,
          requestUrl: 'test1.com',
          expectedText: ['some search string', { text: '2nd string'}, {text: '3rd string', caseSensitive: true}]
        }];

      var results = manager.expandExpectedTextInput(sites);

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

    it('should throw an Error if the expectedText object does not have a text property', function () {
      var sites: SiteConfig[] = [{
        name: 'TestSite',
        expectedStatus: 200,
        requestUrl: 'test1.com',
        expectedText: { random: '2nd string'}
      }];

      var error: Error | undefined;
      try {
        manager.expandExpectedTextInput(sites);
      } catch (e: unknown) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe('text property is missing from expectedText object.');
    });

    it('should throw an Error if the expectedText object has an unrecognized type', function () {
      var sites: SiteConfig[] = [{
        name: 'TestSite',
        expectedStatus: 200,
        requestUrl: 'test1.com',
        expectedText: true
      }];

      var error: Error | undefined;
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
