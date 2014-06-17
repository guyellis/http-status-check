/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var outAdapter = rewire('../outAdapters/consoleAdapter');

describe('outAdapters/consoleAdapter/', function() {
	describe('writeResult()', function () {
		it('should increment success counter when successful', function (done) {
			var failHits = outAdapter.__get__('failHits');
			outAdapter.writeResult('success', {});
			failHits.should.equal(0);
			var successHits = outAdapter.__get__('successHits');
			successHits.should.equal(1);
			done();
		});
	});
});
