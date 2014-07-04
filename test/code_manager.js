/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var manager = rewire('../code/manager');

describe('code/manager/', function() {
	describe('run()', function () {
		it('uses 3 as the default concurrentRequests if not supplied', function (done) {
			var initCalled = false;
			manager.__set__('uriCheck', {
				init: function(outAdapter) {
					initCalled = true;
				}
			});
			var expandInputCalled = false;
			manager.__set__('expandInput', function() {
				expandInputCalled = true;
			});
			var concurrentRequests = 0;
			manager.__set__('iterateURLs', function(concurrentRequestsParam, sites){
				concurrentRequests = concurrentRequestsParam;
			});

			manager.run({});
			concurrentRequests.should.equal(3);
			initCalled.should.equal(true);
			expandInputCalled.should.equal(true);
			done();
		});
		it('uses the number of concurrentRequests supplied', function (done) {
			var initCalled = false;
			manager.__set__('uriCheck', {
				init: function(outAdapter) {
					initCalled = true;
				}
			});
			var expandInputCalled = false;
			manager.__set__('expandInput', function() {
				expandInputCalled = true;
			});
			var concurrentRequests = 0;
			manager.__set__('iterateURLs', function(concurrentRequestsParam, sites){
				concurrentRequests = concurrentRequestsParam;
			});

			manager.run({concurrentRequests: 15});
			concurrentRequests.should.equal(15);
			initCalled.should.equal(true);
			expandInputCalled.should.equal(true);
			done();
		});
		it('should use 3 as the number of concurrentRequests if a number less than 1 is supplied', function (done) {
			var initCalled = false;
			manager.__set__('uriCheck', {
				init: function(outAdapter) {
					initCalled = true;
				}
			});
			var expandInputCalled = false;
			manager.__set__('expandInput', function() {
				expandInputCalled = true;
			});
			var concurrentRequests = 0;
			manager.__set__('iterateURLs', function(concurrentRequestsParam, sites){
				concurrentRequests = concurrentRequestsParam;
			});

			manager.run({concurrentRequests: -1});
			concurrentRequests.should.equal(3);
			initCalled.should.equal(true);
			expandInputCalled.should.equal(true);
			done();
		});
	});

	describe('expandInput()', function () {
		it('expands arrays of requestUrls if they are an array', function (done) {
			var sites = [
				{
					"name": "TestSite",
					"expectedStatus": 200,
					"requestUrl": ["test1.com", "test2.com"]
				}];
			var results = manager.expandInput(sites);
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
			var results = manager.expandInput(sites);
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

});
