'use strict';

import _ from 'lodash';
import manager from './lib/manager.js';
import settings from './package.json' with { type: 'json' };
import outAdapter from './lib/outAdapters/consoleAdapter.js';

var inAdapterPath = settings.inAdapter.type.endsWith('.js')
  ? settings.inAdapter.type
  : settings.inAdapter.type + '.js';
var inAdapterModule = await import(inAdapterPath);
var inAdapter = inAdapterModule.default || inAdapterModule;

var main = async function(verbosity) {
  var sites = await inAdapter.getRunData();
  manager.run(sites, settings, outAdapter, verbosity);
};

var verbose = _.includes(process.argv.slice(2), '--verbose');
await main(verbose);

export {
  main
};

export default {
  main: main
};
