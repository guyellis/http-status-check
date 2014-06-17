/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var uriCheck = rewire('../code/uriCheck');

describe('code/uriCheck/', function() {
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
		it('terminates early if the site is disabled', function (done) {
			var site = {
				disabled: true
			};
			var checkUriCallCount = 0;
			uriCheck.__set__('checkUri', function(site,callback){
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
				writeResult: function(result, uri) {
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
	});

});
