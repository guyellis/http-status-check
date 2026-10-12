'use strict';

var fs = require('fs');
var inAdapter = require('../../../lib/inAdapters/fileAdapter');

describe('inAdapters/fileAdapter/', function() {
  beforeEach(function() {
    delete process.env.HTTP_STATUS_CHECK_FILE;
  });

  describe('getRunData()', function () {
    it('should return samplesites.js data if exists', function () {
      var checksitesChecked = false;
      var samplesitesChecked = false;
      var existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function(filePath) {
        if (typeof filePath === 'string' && filePath.includes('checksites.js')) {
          checksitesChecked = true;
          return false;
        }
        if (typeof filePath === 'string' && filePath.includes('samplesites.js')) {
          samplesitesChecked = true;
          return true;
        }
        return true;
      });

      var runData = inAdapter.getRunData();
      expect(checksitesChecked).toBe(true);
      expect(samplesitesChecked).toBe(true);
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();
      expect(Array.isArray(runData.sites)).toBe(true);

      existsSpy.mockRestore();
    });

    it('should throw an exception if checksites.js and samplesites.js do not exist', function () {
      var previousHttpStatusCheckFileValue = process.env.HTTP_STATUS_CHECK_FILE;
      if (previousHttpStatusCheckFileValue) {
        delete process.env.HTTP_STATUS_CHECK_FILE;
      }
      var existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function(filePath) {
        if (typeof filePath === 'string' && (filePath.includes('checksites.js') || filePath.includes('samplesites.js'))) {
          return false;
        }
        return false;
      });

      var exceptionThrown = false;
      try {
        inAdapter.getRunData();
      } catch (e) {
        exceptionThrown = true;
        expect(e.message).toBe('Expecting HTTP_STATUS_CHECK_FILE environment or checksites.js or samplesites.js to exist.');
      }
      expect(exceptionThrown).toBe(true);

      existsSpy.mockRestore();
      if (previousHttpStatusCheckFileValue) {
        process.env.HTTP_STATUS_CHECK_FILE = previousHttpStatusCheckFileValue;
      }
    });

    it('should return custom file data if HTTP_STATUS_CHECK_FILE exists', function () {
      var samplePath = __dirname + '/../../../sitelists/samplesites.js';
      process.env.HTTP_STATUS_CHECK_FILE = samplePath;

      var existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      var runData = inAdapter.getRunData();
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();

      existsSpy.mockRestore();
      delete process.env.HTTP_STATUS_CHECK_FILE;
    });
  });
});
