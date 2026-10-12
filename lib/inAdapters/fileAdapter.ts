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
  var standardJs = __dirname + '/../../sitelists/checksites.js';
  var rootStandardJs = __dirname + '/../../../sitelists/checksites.js';
  var standardTs = __dirname + '/../../sitelists/checksites.ts';
  var rootStandardTs = __dirname + '/../../../sitelists/checksites.ts';
  var sampleTs = __dirname + '/../../sitelists/samplesites.ts';
  var sampleJs = __dirname + '/../../sitelists/samplesites.js';
  if (custom && fs.existsSync(custom)) {
    return custom;
  } else if (fs.existsSync(standardJs)) {
    return standardJs;
  } else if (fs.existsSync(rootStandardJs)) {
    return rootStandardJs;
  } else if (fs.existsSync(standardTs)) {
    return standardTs;
  } else if (fs.existsSync(rootStandardTs)) {
    return rootStandardTs;
  } else if (fs.existsSync(sampleTs)) {
    return sampleTs;
  } else if (fs.existsSync(sampleJs)) {
    return sampleJs;
  } else {
    debug('standard: %s', standardTs);
    debug('sample: %s', sampleTs);
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
