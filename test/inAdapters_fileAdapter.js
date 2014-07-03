/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var inAdapter = rewire('../inAdapters/fileAdapter');

describe('inAdapters/fileAdapter/', function() {
  inAdapter.__set__('require', function(filename) {
    if(filename.indexOf('checksites') > 0) {
      return {unit: 'checksites'};
    } else {
      return {unit: 'samplesites'};
    }
  });

  describe('getRunData()', function () {
    it('should return checksites.json data if exists', function (done) {
      var existsSyncCallCount = 0;
      inAdapter.__set__('fs', {
        existsSync: function(filename) {
          existsSyncCallCount++;
          return true;
        }
      });
      var runData = inAdapter.getRunData();
      existsSyncCallCount.should.equal(1);
      should.exist(runData.unit);
      runData.unit.should.equal('checksites');
      done();
    });
  });

  describe('getRunData()', function () {
    it('should return samplesites.json data if exists and if checksites.json is missing', function (done) {
      var existsSyncCallCount = 0;
      inAdapter.__set__('fs', {
        existsSync: function(filename) {
          existsSyncCallCount++;
          if(existsSyncCallCount < 2) {
            // In the first call to existsSync we're checking
            // for the existance of checksites.json.
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
    it('should throw an exception if neither samplesites.json or checksites.json exist', function (done) {
      var existsSyncCallCount = 0;
      inAdapter.__set__('fs', {
        existsSync: function(filename) {
          existsSyncCallCount++;
          return false;
        }
      });
      var exceptionThrown = false;
      try {
        inAdapter.getRunData();
      } catch(e) {
        exceptionThrown = true
      }
      existsSyncCallCount.should.equal(2);
      exceptionThrown.should.equal(true);
      done();
    });
  });
});
