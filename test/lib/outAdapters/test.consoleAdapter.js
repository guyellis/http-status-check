'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var outAdapter = rewire('../../../lib/outAdapters/consoleAdapter');

describe('outAdapters/consoleAdapter/', function() {

  describe('organizeErrors()', function () {
    it('should put object properties into an array', function (done) {
      var organizeErrors = outAdapter.__get__('organizeErrors');
      var errors = {
        one: 'one',
        two: 'two'
      };
      var result = organizeErrors(errors);
      should.exist(result);
      Array.isArray(result).should.equal(true);
      result.length.should.equal(2);
      done();
    });
  });

  describe('organizeErrors()', function () {
    it('should put string into an array', function (done) {
      var organizeErrors = outAdapter.__get__('organizeErrors');
      var errors = 'one';
      var result = organizeErrors(errors);
      should.exist(result);
      Array.isArray(result).should.equal(true);
      result.length.should.equal(1);
      result[0].should.equal('one');
      done();
    });
  });

  describe('writeResult()', function () {
    it('should increment success counter when successful', function (done) {
      outAdapter.writeResult('success', {verbose: true});
      //var failHits = outAdapter.__get__('failHits');
      var successHits = outAdapter.__get__('successHits');
      successHits.should.be.above(0);
      done();
    });
  });

  describe('writeResult()', function () {
    it('should increment fail counter when unsuccessful', function (done) {
      outAdapter.writeResult('fail', {errors: 'some error'});
      var failHits = outAdapter.__get__('failHits');
      //var successHits = outAdapter.__get__('successHits');
      failHits.should.be.above(0);
      done();
    });
  });

  describe('writeResult()', function () {
    it('should increment disabled counter when url is disabled', function (done) {
      outAdapter.writeResult('disabled', {verbose: true});
      var disableHits = outAdapter.__get__('disableHits');
      disableHits.should.be.above(0);
      done();
    });
  });

  describe('writeResult()', function () {
    it('should throw an exception if an unrecognized result type is passed', function (done) {
      var exceptionThrown = false;
      try {
        outAdapter.writeResult('unknown', {errors: 'some error'});
      } catch (e) {
        exceptionThrown = true;
      }
      exceptionThrown.should.equal(true);
      done();
    });
  });

  describe('done()', function () {
    it('should call console.log()', function (done) {
      var logCallCount = 0;
      outAdapter.__set__('console',{
        log: function() {
          logCallCount++;
        }
      });

      outAdapter.done();
      logCallCount.should.equal(4);
      done();
    });
  });

});
