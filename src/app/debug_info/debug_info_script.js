import {DebugInfo} from '/lib/debug_info/debug_info.js';
import {applyTranslations, loadLanguageFromConfig, translate}
  from '/lib/util/i18n.js';

(function() {
  const debugInfo = new DebugInfo();
  document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguageFromConfig();
    applyTranslations();
    document.title = translate('debugInfo.title');
    debugInfo.init();
  });
})();
