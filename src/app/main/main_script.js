import {Main} from '/lib/main/main.js';

(function() {
  const main = new Main();
  // Initialisierung sofort starten, falls DOMContentLoaded bereits passiert ist.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => main.init());
  } else {
    main.init();
  }
})();
