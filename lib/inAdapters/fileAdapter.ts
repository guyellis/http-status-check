'use strict';

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import createDebug from 'debug';
import type { InAdapter, RunData } from '../types.js';

const debug = createDebug('http-status-check:fileAdapter');
const __dirname = dirname(fileURLToPath(import.meta.url));

function findFile(): string {
  const custom = process.env.HTTP_STATUS_CHECK_FILE;
  const standardJs = __dirname + '/../../sitelists/checksites.js';
  const rootStandardJs = __dirname + '/../../../sitelists/checksites.js';
  const standardTs = __dirname + '/../../sitelists/checksites.ts';
  const rootStandardTs = __dirname + '/../../../sitelists/checksites.ts';
  const sampleTs = __dirname + '/../../sitelists/samplesites.ts';
  const sampleJs = __dirname + '/../../sitelists/samplesites.js';
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
    throw new Error(
      'Expecting HTTP_STATUS_CHECK_FILE environment or checksites.ts or samplesites.ts to exist.',
    );
  }
}

const getRunData = async function (): Promise<RunData> {
  const file = findFile();
  const fileUrl = pathToFileURL(file).href;
  const mod = await import(fileUrl);
  return mod.default || mod;
};

const fileAdapter: InAdapter = {
  findFile: findFile,
  getRunData: getRunData,
};

export { findFile, getRunData };

export default fileAdapter;
