'use strict';

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import inAdapter from '../../../lib/inAdapters/fileAdapter.js';

var __dirname = dirname(fileURLToPath(import.meta.url));

describe('inAdapters/fileAdapter/', function() {
  beforeEach(function() {
    delete process.env.HTTP_STATUS_CHECK_FILE;
  });

  describe('getRunData()', function () {
    it('should return samplesites.ts data if exists', async function () {
      var checksitesChecked = false;
      var samplesitesChecked = false;
      var existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function(filePath) {
        if (typeof filePath === 'string' && (filePath.includes('checksites.ts') || filePath.includes('checksites.js'))) {
          checksitesChecked = true;
          return false;
        }
        if (typeof filePath === 'string' && (filePath.includes('samplesites.ts') || filePath.includes('samplesites.js'))) {
          samplesitesChecked = true;
          return true;
        }
        return false;
      });

      var runData = await inAdapter.getRunData();
      expect(checksitesChecked).toBe(true);
      expect(samplesitesChecked).toBe(true);
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();
      expect(Array.isArray(runData.sites)).toBe(true);

      existsSpy.mockRestore();
    });

    it('should throw an exception if checksites.ts and samplesites.ts do not exist', async function () {
      var previousHttpStatusCheckFileValue = process.env.HTTP_STATUS_CHECK_FILE;
      if (previousHttpStatusCheckFileValue) {
        delete process.env.HTTP_STATUS_CHECK_FILE;
      }
      var existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function(filePath) {
        if (typeof filePath === 'string' && (filePath.includes('checksites.ts') || filePath.includes('checksites.js') || filePath.includes('samplesites.ts') || filePath.includes('samplesites.js'))) {
          return false;
        }
        return false;
      });

      var exceptionThrown = false;
      try {
        await inAdapter.getRunData();
      } catch (e: unknown) {
        exceptionThrown = true;
        expect((e as Error).message).toBe('Expecting HTTP_STATUS_CHECK_FILE environment or checksites.ts or samplesites.ts to exist.');
      }
      expect(exceptionThrown).toBe(true);

      existsSpy.mockRestore();
      if (previousHttpStatusCheckFileValue) {
        process.env.HTTP_STATUS_CHECK_FILE = previousHttpStatusCheckFileValue;
      }
    });

    it('should return custom file data if HTTP_STATUS_CHECK_FILE exists', async function () {
      var samplePath = __dirname + '/../../../sitelists/samplesites.ts';
      process.env.HTTP_STATUS_CHECK_FILE = samplePath;

      var existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      var runData = await inAdapter.getRunData();
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();

      existsSpy.mockRestore();
      delete process.env.HTTP_STATUS_CHECK_FILE;
    });
  });
});
