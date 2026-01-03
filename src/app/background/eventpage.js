import {Background} from '/lib/background/background.js';
import {g} from '/lib/util/env.js';

(() => {
  const background = new Background();
  g.updateScannerBackground = background;
  background.init();
})();
