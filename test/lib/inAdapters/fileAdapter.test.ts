'use strict';

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import inAdapter from '../../../lib/inAdapters/fileAdapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('inAdapters/fileAdapter/', function () {
  beforeEach(function () {
    delete process.env.HTTP_STATUS_CHECK_FILE;
  });

  describe('getRunData()', function () {
    test('should return samplesites.ts data if exists', async function () {
      let checksitesChecked = false;
      let samplesitesChecked = false;
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        if (
          typeof filePath === 'string' &&
          (filePath.includes('checksites.ts') || filePath.includes('checksites.js'))
        ) {
          checksitesChecked = true;
          return false;
        }
        if (
          typeof filePath === 'string' &&
          (filePath.includes('samplesites.ts') || filePath.includes('samplesites.js'))
        ) {
          samplesitesChecked = true;
          return true;
        }
        return false;
      });

      const runData = await inAdapter.getRunData();
      expect(checksitesChecked).toBe(true);
      expect(samplesitesChecked).toBe(true);
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();
      expect(Array.isArray(runData.sites)).toBe(true);

      existsSpy.mockRestore();
    });

    test('should throw an exception if checksites.ts and samplesites.ts do not exist', async function () {
      const previousHttpStatusCheckFileValue = process.env.HTTP_STATUS_CHECK_FILE;
      if (previousHttpStatusCheckFileValue) {
        delete process.env.HTTP_STATUS_CHECK_FILE;
      }
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        if (
          typeof filePath === 'string' &&
          (filePath.includes('checksites.ts') ||
            filePath.includes('checksites.js') ||
            filePath.includes('samplesites.ts') ||
            filePath.includes('samplesites.js'))
        ) {
          return false;
        }
        return false;
      });

      let exceptionThrown = false;
      try {
        await inAdapter.getRunData();
      } catch (e: unknown) {
        exceptionThrown = true;
        expect((e as Error).message).toBe(
          'Expecting HTTP_STATUS_CHECK_FILE environment or checksites.ts or samplesites.ts to exist.',
        );
      }
      expect(exceptionThrown).toBe(true);

      existsSpy.mockRestore();
      if (previousHttpStatusCheckFileValue) {
        process.env.HTTP_STATUS_CHECK_FILE = previousHttpStatusCheckFileValue;
      }
    });

    test('should return custom file data if HTTP_STATUS_CHECK_FILE exists', async function () {
      const samplePath = __dirname + '/../../../sitelists/samplesites.ts';
      process.env.HTTP_STATUS_CHECK_FILE = samplePath;

      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const runData = await inAdapter.getRunData();
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();

      existsSpy.mockRestore();
      delete process.env.HTTP_STATUS_CHECK_FILE;
    });

    test('should return mod when loaded file has no default export', async function () {
      const fixturePath = __dirname + '/../../fixtures/namedExportSites.ts';
      process.env.HTTP_STATUS_CHECK_FILE = fixturePath;

      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      const runData = await inAdapter.getRunData();
      expect(runData).toBeDefined();
      expect(runData.sites).toBeDefined();
      expect(runData.sites?.[0]?.name).toBe('Named Export Site');

      existsSpy.mockRestore();
      delete process.env.HTTP_STATUS_CHECK_FILE;
    });
  });

  describe('findFile()', function () {
    test('should return standardJs when it exists', function () {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        return typeof filePath === 'string' && filePath.endsWith('/../../sitelists/checksites.js');
      });
      const file = inAdapter.findFile();
      expect(file).toMatch(/\/sitelists\/checksites\.js$/);
      existsSpy.mockRestore();
    });

    test('should return rootStandardJs when it exists', function () {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        return (
          typeof filePath === 'string' && filePath.endsWith('/../../../sitelists/checksites.js')
        );
      });
      const file = inAdapter.findFile();
      expect(file).toMatch(/\/sitelists\/checksites\.js$/);
      existsSpy.mockRestore();
    });

    test('should return standardTs when it exists', function () {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        return typeof filePath === 'string' && filePath.endsWith('/../../sitelists/checksites.ts');
      });
      const file = inAdapter.findFile();
      expect(file).toMatch(/\/sitelists\/checksites\.ts$/);
      existsSpy.mockRestore();
    });

    test('should return rootStandardTs when it exists', function () {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        return (
          typeof filePath === 'string' && filePath.endsWith('/../../../sitelists/checksites.ts')
        );
      });
      const file = inAdapter.findFile();
      expect(file).toMatch(/\/sitelists\/checksites\.ts$/);
      existsSpy.mockRestore();
    });

    test('should return sampleJs when it exists and sampleTs does not', function () {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(function (filePath) {
        return typeof filePath === 'string' && filePath.endsWith('/../../sitelists/samplesites.js');
      });
      const file = inAdapter.findFile();
      expect(file).toMatch(/\/sitelists\/samplesites\.js$/);
      existsSpy.mockRestore();
    });
  });
});
