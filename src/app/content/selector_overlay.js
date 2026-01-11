(() => {
  const startAction = 'start-area-selection';
  const resultAction = 'set-area-selector';
  const overlayId = 'updatescanner-area-overlay';

  let isActive = false;
  let overlay = null;
  let lastTarget = null;

  function createOverlay() {
    const box = document.createElement('div');
    box.id = overlayId;
    box.style.position = 'fixed';
    box.style.top = '0';
    box.style.left = '0';
    box.style.width = '0';
    box.style.height = '0';
    box.style.border = '2px solid #4c9aff';
    box.style.background = 'rgba(76, 154, 255, 0.15)';
    box.style.pointerEvents = 'none';
    box.style.zIndex = '2147483647';
    return box;
  }

  function ensureOverlay() {
    if (overlay) {
      return overlay;
    }
    overlay = createOverlay();
    document.documentElement.appendChild(overlay);
    return overlay;
  }

  function clearOverlay() {
    if (!overlay) {
      return;
    }
    overlay.remove();
    overlay = null;
  }

  function updateOverlay(target) {
    if (!target || !(target instanceof Element)) {
      return;
    }
    if (target === overlay) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const box = ensureOverlay();
    box.style.top = `${rect.top}px`;
    box.style.left = `${rect.left}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return value.replace(/([ #;.?%&,:+*~'"!^$\[\]()=>|])/g, '\\$1');
  }

  function buildSelectorForElement(element) {
    if (!element || !(element instanceof Element)) {
      return '';
    }

    if (element.id) {
      return `#${escapeSelector(element.id)}`;
    }

    const segments = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let segment = current.tagName.toLowerCase();
      const classList = Array.from(current.classList || []);
      if (classList.length > 0) {
        segment += `.${classList.map(escapeSelector).join('.')}`;
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children)
          .filter((child) => child.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          segment += `:nth-of-type(${index})`;
        }
      }

      segments.unshift(segment);
      if (current.id) {
        break;
      }
      current = current.parentElement;
    }

    return segments.join(' > ');
  }

  function stopSelection() {
    if (!isActive) {
      return;
    }
    isActive = false;
    lastTarget = null;
    clearOverlay();
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('mouseover', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
  }

  function handleMouseMove(event) {
    if (!isActive) {
      return;
    }
    const target = event.target;
    if (target === lastTarget) {
      return;
    }
    lastTarget = target;
    updateOverlay(target);
  }

  function handleClick(event) {
    if (!isActive) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const selector = buildSelectorForElement(event.target);
    browser.runtime.sendMessage({
      action: resultAction,
      selector,
      url: window.location.href,
    });
    stopSelection();
  }

  function handleKeyDown(event) {
    if (!isActive) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      stopSelection();
    }
  }

  function startSelection() {
    if (isActive) {
      return;
    }
    isActive = true;
    ensureOverlay();
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseover', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message?.action === startAction) {
      startSelection();
    }
  });
})();
