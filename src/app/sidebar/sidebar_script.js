import {Sidebar} from '/lib/sidebar/sidebar.js';
import {applyTranslations, loadLanguageFromConfig, translate}
  from '/lib/util/i18n.js';

(function() {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguageFromConfig();
    applyTranslations();
    document.title = translate('app.title');
    const sidebar = new Sidebar();
    sidebar.init();
  });
})();
