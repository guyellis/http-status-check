/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var outAdapter = require('../outAdapters/consoleAdapter');

describe('outAdapters/consoleAdapter/', function() {
	describe('writeResult()', function () {
		it('should increment success counter when successful', function (done) {
			var successCount = outAdapter.successCount();
			outAdapter.writeResult('success', {});
			outAdapter.failCount().should.be.equal(0);
			outAdapter.successCount().should.be.above(successCount);
			done();
		});
	});
});
