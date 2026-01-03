import {Popup} from '/lib/popup/popup.js';

(function() {
  const popup = new Popup();
  document.addEventListener('DOMContentLoaded', () => {
    popup.init();
    initFilters();
  });
})();

const FILTER_DEBOUNCE_MS = 250;

/**
 * Initialisiert Suche, Filter-Chips und Empty-States im Popup.
 */
function initFilters() {
  const list = document.querySelector('#list');
  const searchInput = document.querySelector('#search-input');
  const emptyState = document.querySelector('#list-empty');
  const emptyFilterState = document.querySelector('#list-empty-filter');
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
  const allChip = filterChips.find((chip) => chip.dataset.filter === 'all');
  if (!list || !searchInput || !emptyState || !emptyFilterState || !allChip) {
    return;
  }

  const activeFilters = new Set();

  const applyFilters = () => {
    const items = Array.from(list.querySelectorAll('.panel-list-item'));
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const title = (item.dataset.title || item.textContent).toLowerCase();
      const status = item.dataset.status;
      const matchesSearch = searchTerm.length === 0 || title.includes(searchTerm);
      const matchesFilter =
        activeFilters.size === 0 || activeFilters.has(status);
      const isVisible = matchesSearch && matchesFilter;
      item.classList.toggle('is-filtered-out', !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    updateEmptyStates(items.length, visibleCount);
  };

  const updateEmptyStates = (totalCount, visibleCount) => {
    if (totalCount === 0) {
      emptyState.classList.remove('hidden');
      emptyFilterState.classList.add('hidden');
      return;
    }
    emptyState.classList.add('hidden');
    emptyFilterState.classList.toggle('hidden', visibleCount !== 0);
  };

  const debouncedSearch = debounce(applyFilters, FILTER_DEBOUNCE_MS);
  searchInput.addEventListener('input', debouncedSearch);

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      if (filter === 'all') {
        activeFilters.clear();
        setChipActive(allChip, true);
        filterChips
          .filter((entry) => entry !== allChip)
          .forEach((entry) => setChipActive(entry, false));
      } else {
        const isActive = !chip.classList.contains('active');
        setChipActive(chip, isActive);
        if (isActive) {
          activeFilters.add(filter);
        } else {
          activeFilters.delete(filter);
        }
        setChipActive(allChip, activeFilters.size === 0);
      }
      applyFilters();
    });
  });

  const observer = new MutationObserver(() => {
    applyFilters();
  });
  observer.observe(list, {childList: true});

  applyFilters();
}

/**
 * Setzt den aktiven Zustand einer Filter-Chip-Schaltfläche.
 *
 * @param {HTMLElement} chip - Ziel-Chip.
 * @param {boolean} isActive - Aktivzustand.
 */
function setChipActive(chip, isActive) {
  chip.classList.toggle('active', isActive);
  chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
}

/**
 * Erstellt eine debouncte Funktion.
 *
 * @param {Function} handler - Callback für die Ausführung.
 * @param {number} delayMs - Verzögerung in Millisekunden.
 * @returns {Function} Debouncte Funktion.
 */
function debounce(handler, delayMs) {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => handler(...args), delayMs);
  };
}
