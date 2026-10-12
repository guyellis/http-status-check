'use strict';

import outAdapter from '../../../lib/outAdapters/emailAdapter.js';

describe('outAdapters/emailAdapter/', function() {

  describe('organizeErrors()', function () {
    it('should put object properties into an array', function () {
      var organizeErrors = outAdapter.organizeErrors;
      var errors = {
        one: 'one',
        two: 'two'
      };
      var result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('organizeErrors()', function () {
    it('should put string into an array', function () {
      var organizeErrors = outAdapter.organizeErrors;
      var errors = 'one';
      var result = organizeErrors(errors);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBe('one');
    });
  });

  describe('writeResult()', function () {
    it('should increment success counter when successful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('success', {verbose: true});
      var successHits = outAdapter.getSuccessHits();
      expect(successHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should increment fail counter when unsuccessful', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('fail', {errors: 'some error'});
      var failHits = outAdapter.getFailHits();
      expect(failHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should increment disabled counter when url is disabled', function () {
      outAdapter.resetHits();
      outAdapter.writeResult('disabled', {verbose: true});
      var disableHits = outAdapter.getDisableHits();
      expect(disableHits).toBeGreaterThan(0);
    });
  });

  describe('writeResult()', function () {
    it('should throw an exception if an unrecognized result type is passed', function () {
      var exceptionThrown = false;
      try {
        outAdapter.writeResult('unknown', {errors: 'some error'});
      } catch (e) {
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(true);
    });
  });

});
