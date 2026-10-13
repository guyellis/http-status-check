'use strict';

import inAdapter from '../lib/inAdapters/fileAdapter.js';
import manager from '../lib/manager.js';

describe('index/', function () {
  describe('main()', function () {
    test('should call getRunData() and manager.run()', async function () {
      const getRunDataSpy = vi.spyOn(inAdapter, 'getRunData').mockResolvedValue({ sites: [] });
      const runSpy = vi.spyOn(manager, 'run').mockImplementation(function () {});
      const index = await import('../index.js');

      await index.main();

      expect(getRunDataSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalled();

      getRunDataSpy.mockRestore();
      runSpy.mockRestore();
    });
  });
});
