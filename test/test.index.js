'use strict';

var manager = require('../lib/manager');
var inAdapter = require('../lib/inAdapters/fileAdapter');

describe('index/', function() {
  describe('main()', function () {
    it('should call getRunData() and manager.run()', function () {
      var getRunDataSpy = vi.spyOn(inAdapter, 'getRunData').mockReturnValue({ sites: [] });
      var runSpy = vi.spyOn(manager, 'run').mockImplementation(function() {});
      var index = require('../index');

      index.main();

      expect(getRunDataSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalled();

      getRunDataSpy.mockRestore();
      runSpy.mockRestore();
    });
  });
});
