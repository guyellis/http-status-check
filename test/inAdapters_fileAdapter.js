/*jshint node:true */
/*global describe:false, it:false */

'use strict';

var should = require('chai').should();
var rewire = require('rewire');
var inAdapter = rewire('../inAdapters/fileAdapter');

describe('inAdapters/fileAdapter/', function() {
	inAdapter.__set__('require', function(filename) {
		return {unit: 'test'};
	});

	describe('getRunData()', function () {
		it('should return checksites.json data if exists', function (done) {
			var existsSyncCallCount = 0;
			inAdapter.__set__('fs', {
				existsSync: function(filename) {
					existsSyncCallCount++;
					return true;
				}
			});
			var runData = inAdapter.getRunData();
			existsSyncCallCount.should.equal(1);
			console.log(runData);
			should.exist(runData.unit);
			runData.unit.should.equal('test');
			done();
		});
	});
});
