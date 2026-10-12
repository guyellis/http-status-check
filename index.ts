'use strict';

import _ from 'lodash';
import manager from './lib/manager.js';
import outAdapter from './lib/outAdapters/consoleAdapter.js';
import settings from './package.json' with { type: 'json' };

const inAdapterPath = settings.inAdapter.type.endsWith('.js')
  ? settings.inAdapter.type
  : settings.inAdapter.type + '.js';
const inAdapterModule = await import(inAdapterPath);
const inAdapter = inAdapterModule.default || inAdapterModule;

const main = async function (verbosity?: boolean): Promise<void> {
  const sites = await inAdapter.getRunData();
  manager.run(sites, settings, outAdapter, verbosity);
};

const verbose = _.includes(process.argv.slice(2), '--verbose');
await main(verbose);

export { main };

export default {
  main: main,
};
