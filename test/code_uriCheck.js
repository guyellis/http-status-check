'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var uriCheck = rewire('../lib/uriCheck');

describe('lib/uriCheck/', function() {
  describe('init()', function () {
    it('sets the outAdapter', function (done) {
      uriCheck.init({test:true});
      var outAdapter = uriCheck.__get__("outAdapter");
      outAdapter.test.should.equal(true);
      done();
    });
  });

  describe('startsWith()', function () {
    var testString = 'this is a string';
    var startsWith = uriCheck.__get__('startsWith');

    it('should return true if the string starts with one of the array items', function (done) {
      var protocols = ['this', 'is'];
      var result = startsWith(testString,protocols);
      result.should.equal(true);
      done();
    });

    it('should return false if the string starts with one of the array items', function (done) {
      var protocols = ['that', 'is'];
      var result = startsWith(testString,protocols);
      result.should.equal(false);
      done();
    });
  });

  describe('checkUri()', function () {
    it('should terminate early if the site is disabled', function (done) {
      var site = {
        disabled: true
      };
      var checkUriCallCount = 0;
      uriCheck.__set__('checkUri', function(/*site, callback*/){
        checkUriCallCount++;
      });
      var writeResultCallCount = 0;
      uriCheck.__set__('outAdapter',{
        writeResult: function() {
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      checkUriCallCount.should.equal(0);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);

      done();
    });

    it('should call writeResult with fail if request.get() returns an error', function (done) {
      var site = {
        "name": "Unit Test",
        "expectedStatus": 200,
        // missing http in front of requestedUrl will be added by call to checkUri
        "requestUrl": "www.unittest.com",
        "requestHeaders": {
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0"
        }
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          return callback({Error: new Error('Unit Test Error')});
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with fail if the status lib is not what is expected', function (done) {
      var site = {
        "name": "Unit Test",
        "expectedStatus": 200,
        // missing http in front of requestedUrl will be added by call to checkUri
        "requestUrl": "www.unittest.com",
        "requestHeaders": {
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0"
        }
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = {
            statusCode: 301
          };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with fail if the response headers do not match', function (done) {
      var site = {
        "name": "Unit Test",
        "expectedStatus": 301,
        "requestUrl": "www.unittest.com",
        "responseHeaders": {
          "location": "http://unittest.com/"
        }
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = {
            statusCode: 301,
            headers: {
              'location': 'it is not a match'
            }
          };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with fail if an excludedHeaders header is present', function (done) {
      var site = {
        name: "Unit Test",
        expectedStatus: 200,
        requestUrl: "www.unittest.com",
        excludedHeaders: ['X-Powered-By']
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = {
            statusCode: 200,
            headers: {
              'x-powered-by': 'ASP.NET'
            }
          };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with fail if expected case insensitive text is missing', function (done) {
      var site = {
        name: "Unit Test",
        expectedStatus: 200,
        requestUrl: "www.unittest.com",
        expectedText: [{text: 'some random text'}]
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = { statusCode: 200 };
          var body = 'this body does not have the random text we are looking for';
          return callback(null,response, body);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with fail if expected case-sensitive text is missing', function (done) {
      var site = {
        name: "Unit Test",
        expectedStatus: 200,
        requestUrl: "www.unittest.com",
        expectedText: [{text: 'Random Text', caseSensitive: true}]
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = { statusCode: 200 };
          var body = 'this body does not have the random text we are looking for';
          return callback(null,response, body);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });


    it('should call writeResult with fail if there is expected text and the response body is missing', function (done) {
      var site = {
        name: "Unit Test",
        expectedStatus: 200,
        requestUrl: "www.unittest.com",
        expectedText: [{text: 'Random Text', caseSensitive: true}]
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = { statusCode: 200 };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('fail');

      done();
    });

    it('should call writeResult with success if the response headers and statuses match', function (done) {
      var site = {
        "name": "Unit Test",
        "expectedStatus": 301,
        "requestUrl": "www.unittest.com",
        "responseHeaders": {
          "location": "http://unittest.com/"
        }
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = {
            statusCode: 301,
            headers: {
              'location': 'http://unittest.com/'
            }
          };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('success');

      done();
    });

    it('should call writeResult with success if the statuses match', function (done) {
      var site = {
        "name": "Unit Test",
        "expectedStatus": 301,
        "requestUrl": "www.unittest.com"
      };

      var requestGetCallCount = 0;
      uriCheck.__set__('request', {
        get: function(options, callback) {
          requestGetCallCount++;
          var response = {
            statusCode: 301
          };
          return callback(null,response);
        }
      });
      var writeResultCallCount = 0;
      var writeResultResult = '';
      uriCheck.__set__('outAdapter',{
        writeResult: function(result/*, uri*/) {
          writeResultResult = result;
          writeResultCallCount++;
        }
      });
      var errValue = {};
      uriCheck.checkUri(site, function(err) {
        errValue = err;
      });
      requestGetCallCount.should.equal(1);
      writeResultCallCount.should.equal(1);
      should.not.exist(errValue);
      writeResultResult.should.equal('success');

      done();
    });
  });

  describe('done()', function () {
    it('should call the outAdapters done method', function (done) {
      var doneCallCount = 0;
      uriCheck.__set__('outAdapter', {
        done: function () {
          doneCallCount++;
        }
      });
      uriCheck.done();

      doneCallCount.should.equal(1);

      done();
    });
  });

});
