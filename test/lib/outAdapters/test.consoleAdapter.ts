'use strict';

import outAdapter from '../../../lib/outAdapters/consoleAdapter.js';

describe('outAdapters/consoleAdapter/', function () {
  describe('organizeErrors()', function () {
    it('should put object properties into an array', function () {
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
    it('should put string into an array', function () {
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
    it('should increment success counter when successful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('success', { verbose: true });
      const successHits = outAdapter.getSuccessHits();
      expect(successHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should increment fail counter when unsuccessful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', { errors: 'some error' });
      const failHits = outAdapter.getFailHits();
      expect(failHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should increment disabled counter when url is disabled', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('disabled', { verbose: true });
      const disableHits = outAdapter.getDisableHits();
      expect(disableHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should throw an exception if an unrecognized result type is passed', function () {
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
    it('should call console.log()', function () {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(function () {});

      outAdapter.done();
      expect(logSpy).toHaveBeenCalledTimes(4);

      logSpy.mockRestore();
    });
  });
});
