'use strict';

import createDebug from 'debug';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { InAdapter, RunData } from '../types.js';

var debug = createDebug('http-status-check:fileAdapter');
var __dirname = dirname(fileURLToPath(import.meta.url));

function findFile(): string {
  var custom = process.env.HTTP_STATUS_CHECK_FILE;
  var standard = __dirname + '/../../sitelists/checksites.ts';
  var sample = __dirname + '/../../sitelists/samplesites.ts';
  if (custom && fs.existsSync(custom)) {
    return custom;
  } else if (fs.existsSync(standard)) {
    return standard;
  } else if (fs.existsSync(sample)) {
    return sample;
  } else {
    debug('standard: %s', standard);
    debug('sample: %s', sample);
    throw new Error('Expecting HTTP_STATUS_CHECK_FILE environment or checksites.ts or samplesites.ts to exist.');
  }
}

var getRunData = async function(): Promise<RunData> {
  var file = findFile();
  var fileUrl = pathToFileURL(file).href;
  var mod = await import(fileUrl);
  return mod.default || mod;
};

var fileAdapter: InAdapter = {
  findFile: findFile,
  getRunData: getRunData
};

export {
  findFile,
  getRunData
};

export default fileAdapter;
