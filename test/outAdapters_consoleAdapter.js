/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var outAdapter = rewire('../outAdapters/consoleAdapter');

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
			outAdapter.writeResult('success', {});
			var failHits = outAdapter.__get__('failHits');
			var successHits = outAdapter.__get__('successHits');
			successHits.should.be.above(0);
			done();
		});
	});

	describe('writeResult()', function () {
		it('should increment fail counter when unsuccessful', function (done) {
			outAdapter.writeResult('fail', {});
			var failHits = outAdapter.__get__('failHits');
			var successHits = outAdapter.__get__('successHits');
			failHits.should.be.above(0);
			done();
		});
	});
});
