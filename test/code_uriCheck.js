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
			var eachSiteCallCount = 0;
			uriCheck.__set__('checkUri', function(site,callback){
				eachSiteCallCount++;
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
			eachSiteCallCount.should.equal(0);
			writeResultCallCount.should.equal(1);
			should.not.exist(errValue);

			done();
		});
	});

});
