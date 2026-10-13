'use strict';

import outAdapter from '../../../lib/outAdapters/consoleAdapter.js';

describe('outAdapters/consoleAdapter/', function () {
  describe('organizeErrors()', function () {
    test('should put object properties into an array', function () {
      const organizeErrors = outAdapter.organizeErrors;
      const errors = {
        one: 'one',
        two: 'two',
      };
      const result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('organizeErrors()', function () {
    test('should put string into an array', function () {
      const organizeErrors = outAdapter.organizeErrors;
      const errors = 'one';
      const result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBe('one');
    });
  });

  describe('writeResult()', function () {
    test('should increment success counter when successful', function () {
      outAdapter.resetHits();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(function () {});
      outAdapter.writeResult('success', {
        name: 'test-site',
        requestUrl: 'https://example.com',
        verbose: true,
      });
      const successHits = outAdapter.getSuccessHits();
      expect(successHits).toBe(1);
      expect(logSpy).toHaveBeenCalledWith('_ test-site (https://example.com) working as expected.');
      logSpy.mockRestore();
    });
  });

  describe('writeResult()', function () {
    test('should increment fail counter when unsuccessful', function () {
      outAdapter.resetHits();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(function () {});
      outAdapter.writeResult('fail', {
        errors: 'some error',
        name: 'test-site',
        requestUrl: 'https://example.com',
      });
      const failHits = outAdapter.getFailHits();
      expect(failHits).toBe(1);
      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        'X test-site (https://example.com) failed. Here are the problems:',
      );
      expect(logSpy).toHaveBeenNthCalledWith(2, '  - some error');
      logSpy.mockRestore();
    });
  });

  describe('writeResult()', function () {
    test('should increment disabled counter when url is disabled', function () {
      outAdapter.resetHits();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(function () {});
      outAdapter.writeResult('disabled', {
        name: 'test-site',
        requestUrl: 'https://example.com',
        verbose: true,
      });
      const disableHits = outAdapter.getDisableHits();
      expect(disableHits).toBe(1);
      expect(logSpy).toHaveBeenCalledWith('_ test-site (https://example.com) testing disabled.');
      logSpy.mockRestore();
    });
  });

  describe('writeResult()', function () {
    test('should throw an exception if an unrecognized result type is passed', function () {
      let exceptionThrown = false;
      try {
        outAdapter.writeResult('unknown', { errors: 'some error' });
      } catch (_e) {
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(true);
    });
  });

  describe('done()', function () {
    test('should call console.log()', function () {
      outAdapter.resetHits();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(function () {});

      outAdapter.done();
      expect(logSpy).toHaveBeenCalledTimes(4);
      expect(logSpy).toHaveBeenNthCalledWith(1, 'A total of 0 URIs were tested.');
      expect(logSpy).toHaveBeenNthCalledWith(2, 'Failure count: ', 0);
      expect(logSpy).toHaveBeenNthCalledWith(3, 'Success count: ', 0);
      expect(logSpy).toHaveBeenNthCalledWith(4, 'Disable count: ', 0);

      logSpy.mockRestore();
    });
  });
});
