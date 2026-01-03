import {init} from '/lib/backup/restore.js';
import {applyTranslations, loadLanguageFromConfig, translate}
  from '/lib/util/i18n.js';

(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguageFromConfig();
    applyTranslations();
    document.title = translate('restore.pageTitle');
    init();
  });
})();
