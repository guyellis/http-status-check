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

	describe('siteCheck()', function () {
		it('terminates early if the site is disabled', function (done) {
			var site = {
				disabled: true
			};
			var eachSiteCallCount = 0;
			uriCheck.__set__('eachSite', function(site,callback){
				eachSiteCallCount++;
			});
			var writeResultCallCount = 0;
			uriCheck.__set__('outAdapter',{
				writeResult: function() {
					writeResultCallCount++;
				}
			});
			var errValue = {};
			uriCheck.siteCheck(site, function(err) {
				errValue = err;
			});
			eachSiteCallCount.should.equal(0);
			writeResultCallCount.should.equal(1);
			should.not.exist(errValue);

			done();
		});
	});

});
