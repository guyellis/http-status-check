'use strict';

import inAdapter from '../lib/inAdapters/fileAdapter.js';
import manager from '../lib/manager.js';

describe('index/', function() {
  describe('main()', function () {
    it('should call getRunData() and manager.run()', async function () {
      var getRunDataSpy = vi.spyOn(inAdapter, 'getRunData').mockResolvedValue({ sites: [] });
      var runSpy = vi.spyOn(manager, 'run').mockImplementation(function() {});
      var index = await import('../index.js');

      await index.main();

      expect(getRunDataSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalled();

      getRunDataSpy.mockRestore();
      runSpy.mockRestore();
    });
  });
});
