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
	});
});
