'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var inAdapter = rewire('../../../lib/inAdapters/fileAdapter');

describe('inAdapters/fileAdapter/', function() {
  inAdapter.__set__('require', function(filename) {
    if(filename.indexOf('alexa100') > 0) {
      return {unit: 'alexa100'};
    } else {
      return {unit: 'samplesites'};
    }
  });

  describe('getRunData()', function () {
    it('should return samplesites.js data if exists', function (done) {
      var existsSyncCallCount = 0;
      inAdapter.__set__('fs', {
        existsSync: function(/*filename*/) {
          existsSyncCallCount++;
          if(existsSyncCallCount < 2) {
            // In the first call to existsSync we're checking
            // for the existance of checksites.js.
            // In this test we want to simulate that it doesn't
            // exist so going to return false the first time.
            return false;
          }
          return true;
        }
      });
      var runData = inAdapter.getRunData();
      existsSyncCallCount.should.equal(2);
      should.exist(runData.unit);
      runData.unit.should.equal('samplesites');
      done();
    });
  });

  describe('getRunData()', function () {
    it('should throw an exception if checksites.js does not exist', function (done) {
      // Save previous state of HTTP_STATUS_CHECK_FILE if it is truthy
      var previouseHttpStatusCheckFileValue = process.env.HTTP_STATUS_CHECK_FILE;
      if(previouseHttpStatusCheckFileValue) {
        delete process.env.HTTP_STATUS_CHECK_FILE;
      }
      var existsSyncCallCount = 0;
      inAdapter.__set__('fs', {
        existsSync: function(/*filename*/) {
          existsSyncCallCount++;
          return false;
        }
      });
      var exceptionThrown = false;
      try {
        inAdapter.getRunData();
      } catch(e) {
        exceptionThrown = true;
      }
      existsSyncCallCount.should.equal(2);
      exceptionThrown.should.equal(true);

      // Restore previous state of HTTP_STATUS_CHECK_FILE
      if(previouseHttpStatusCheckFileValue) {
        process.env.HTTP_STATUS_CHECK_FILE = previouseHttpStatusCheckFileValue;
      }

      done();
    });
  });
});
