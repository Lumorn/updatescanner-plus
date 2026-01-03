import {update} from '/lib/update/update.js';
import {applyTranslations, loadLanguageFromConfig, translate}
  from '/lib/util/i18n.js';

(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguageFromConfig();
    applyTranslations();
    document.title = translate('update.title');
    update();
  });
})();
