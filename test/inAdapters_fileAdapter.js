/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var inAdapter = rewire('../inAdapters/fileAdapter');

describe('inAdapters/fileAdapter/', function() {
	inAdapter.__set__('require', function(filename) {
		if(filename.indexOf('checksites') > 0) {
			return {unit: 'checksites'};
		} else {
			return {unit: 'samplesites'};
		}
	});

	describe('getRunData()', function () {
		it('should return checksites.json data if exists', function (done) {
			inAdapter.__set__('standard', {});
			inAdapter.__set__('sample', null);
			var runData = inAdapter.getRunData();
			should.exist(runData);
			done();
		});
	});

	describe('getRunData()', function () {
		it('should return samplesites.json data if exists and if checksites.json is missing', function (done) {
			inAdapter.__set__('standard', null);
			inAdapter.__set__('sample', {});
			var runData = inAdapter.getRunData();
			should.exist(runData);
			done();
		});
	});

	describe('getRunData()', function () {
		it('should throw an exception if neither samplesites.json or checksites.json exist', function (done) {
      inAdapter.__set__('standard', null);
      inAdapter.__set__('sample', null);
			var exceptionThrown = false;
      var runData = null;
			try {
				inAdapter.getRunData();
			} catch(e) {
				exceptionThrown = true
			}
      should.not.exist(runData);
			exceptionThrown.should.equal(true);
			done();
		});
	});
});
