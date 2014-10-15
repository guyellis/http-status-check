'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var manager = rewire('../lib/manager');
var _ = require('lodash');

describe('lib/manager/', function() {
  describe('run()', function () {
    it('uses 3 as the default concurrentRequests if not supplied', function (done) {
      var initCalled = false;
      manager.__set__('uriCheck', {
        init: function(/*outAdapter*/) {
          initCalled = true;
        }
      });
      var expandRequestUrlInputCalled = false;
      manager.__set__('expandRequestUrlInput', function() {
        expandRequestUrlInputCalled = true;
      });
      var concurrentRequests = 0;
      manager.__set__('iterateURLs', function(concurrentRequestsParam/*, sites*/){
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({});
      concurrentRequests.should.equal(3);
      initCalled.should.equal(true);
      expandRequestUrlInputCalled.should.equal(true);
      done();
    });
    it('uses the number of concurrentRequests supplied', function (done) {
      var initCalled = false;
      manager.__set__('uriCheck', {
        init: function(/*outAdapter*/) {
          initCalled = true;
        }
      });
      var expandRequestUrlInputCalled = false;
      manager.__set__('expandRequestUrlInput', function() {
        expandRequestUrlInputCalled = true;
      });
      var concurrentRequests = 0;
      manager.__set__('iterateURLs', function(concurrentRequestsParam/*, sites*/){
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({concurrentRequests: 15});
      concurrentRequests.should.equal(15);
      initCalled.should.equal(true);
      expandRequestUrlInputCalled.should.equal(true);
      done();
    });
    it('should use 3 as the number of concurrentRequests if a number less than 1 is supplied', function (done) {
      var initCalled = false;
      manager.__set__('uriCheck', {
        init: function(/*outAdapter*/) {
          initCalled = true;
        }
      });
      var expandRequestUrlInputCalled = false;
      manager.__set__('expandRequestUrlInput', function() {
        expandRequestUrlInputCalled = true;
      });
      var concurrentRequests = 0;
      manager.__set__('iterateURLs', function(concurrentRequestsParam/*, sites*/){
        concurrentRequests = concurrentRequestsParam;
      });

      manager.run({concurrentRequests: -1});
      concurrentRequests.should.equal(3);
      initCalled.should.equal(true);
      expandRequestUrlInputCalled.should.equal(true);
      done();
    });
  });

  describe('expandRequestUrlInput()', function () {
    it('expands arrays of requestUrls if they are an array', function (done) {
      var sites = [
        {
          "name": "TestSite",
          "expectedStatus": 200,
          "requestUrl": ["test1.com", "test2.com"]
        }];
      var results = manager.expandRequestUrlInput(sites);
      results.length.should.equal(2);
      Array.isArray(results).should.equal(true);
      done();
    });
    it('does nothing if requestUrls is not an array', function (done) {
      var sites = [
        {
          "name": "TestSite",
          "expectedStatus": 200,
          "requestUrl": "test1.com"
        }];
      var results = manager.expandRequestUrlInput(sites);
      results.length.should.equal(1);
      Array.isArray(results).should.equal(true);
      done();
    });
  });

  describe('iterateURLs()', function () {
    it('calls uriCheck.done() when finished', function (done) {
      var sites = [
        {
          "name": "TestSite",
          "expectedStatus": 200,
          "requestUrl": "test1.com"
        }];
      var checkUriCallCount = 0;
      var doneCallCount = 0;
      manager.__set__('uriCheck',{
        checkUri: function(site,callback){
          checkUriCallCount++;
          callback();
        },
        done: function() {
          doneCallCount++;
        }
      });
      manager.iterateURLs(3, sites);
      checkUriCallCount.should.equal(1);
      doneCallCount.should.equal(1);
      done();
    });
    it('throws an error if checkUri calls back with error', function (done) {
      var sites = [
        {
          "name": "TestSite",
          "expectedStatus": 200,
          "requestUrl": "test1.com"
        }];
      var checkUriCallCount = 0;
      var doneCallCount = 0;
      manager.__set__('uriCheck',{
        checkUri: function(site,callback){
          checkUriCallCount++;
          callback(new Error('Unit Test Error'));
        },
        done: function() {
          doneCallCount++;
        }
      });
      var exceptionText = '';
      try {
        manager.iterateURLs(3, sites);
      } catch(e) {
        exceptionText = e.toString();
      }
      exceptionText.should.equal('Error: Unit Test Error');
      checkUriCallCount.should.equal(1);
      doneCallCount.should.equal(0);
      done();
    });
  });

  describe('expandExpectedTextInput()', function () {
    it('should do nothing if there is no expectedText property', function (done) {
      var sites = [
        {
          name: "TestSite",
          expectedStatus: 200,
          requestUrl: "test1.com"
        }];

      var results = manager.expandExpectedTextInput(sites);

      should.exist(results);
      _.isArray(results).should.equal(true);
      results.length.should.equal(1);
      should.not.exist(results[0].expectedText);
      results[0].name.should.equal('TestSite');
      done();
    });

    it('should expand expectedText property if it is a single string', function (done) {
      // Setup for the test
      var sites = [
        {
          name: "TestSite",
          expectedStatus: 200,
          requestUrl: "test1.com",
          expectedText: 'some search string'
        }];

      // Execute function we want to test
      var results = manager.expandExpectedTextInput(sites);

      // Assertions
      should.exist(results);
      _.isArray(results).should.equal(true);
      results.length.should.equal(1);
      results[0].name.should.equal('TestSite');
      _.isArray(results[0].expectedText).should.equal(true);
      results[0].expectedText.length.should.equal(1);
      results[0].expectedText[0].text.should.equal('some search string');

      done();
    });

    it('should expand expectedText property if it is an array of strings and/or objects', function (done) {
      // Setup for the test
      var sites = [
        {
          name: "TestSite",
          expectedStatus: 200,
          requestUrl: "test1.com",
          expectedText: ['some search string', { text: '2nd string'}, {text: '3rd string', caseSensitive: true}]
        }];

      // Execute function we want to test
      var results = manager.expandExpectedTextInput(sites);

      // Assertions
      should.exist(results);
      _.isArray(results).should.equal(true);
      results.length.should.equal(1);
      results[0].name.should.equal('TestSite');
      _.isArray(results[0].expectedText).should.equal(true);
      results[0].expectedText.length.should.equal(3);
      results[0].expectedText[0].text.should.equal('some search string');
      should.not.exist(results[0].expectedText[0].caseSensitive);
      results[0].expectedText[1].text.should.equal('2nd string');
      should.not.exist(results[0].expectedText[1].caseSensitive);
      results[0].expectedText[2].text.should.equal('3rd string');
      should.exist(results[0].expectedText[2].caseSensitive);
      results[0].expectedText[2].caseSensitive.should.equal(true);

      done();
    });

    it('should throw an Error if the expectedText object does not have a text property', function (done) {
      // Setup for the test
      var sites = [{
        name: "TestSite",
        expectedStatus: 200,
        requestUrl: "test1.com",
        expectedText: { random: '2nd string'}
      }];

      var error;
      try {
        // Execute function we want to test
        manager.expandExpectedTextInput(sites);
      } catch(e) {
        error = e;
      }

      // Assertions
      should.exist(error);
      error.message.should.equal('text property is missing from expectedText object.');

      done();
    });

    it('should throw an Error if the expectedText object has an unrecognized type', function (done) {
      // Setup for the test
      var sites = [{
        name: "TestSite",
        expectedStatus: 200,
        requestUrl: "test1.com",
        expectedText: true
      }];

      var error;
      try {
        // Execute function we want to test
        manager.expandExpectedTextInput(sites);
      } catch(e) {
        error = e;
      }

      // Assertions
      should.exist(error);
      error.message.should.equal('Unknown/Unexpected type for text property.');

      done();
    });
  });

});
