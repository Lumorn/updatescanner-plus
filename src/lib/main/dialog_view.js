import {qs, $on, hideElement, showElement} from '/lib/util/view_helpers.js';
import {translate} from '/lib/util/i18n.js';

// See https://bugzilla.mozilla.org/show_bug.cgi?id=840640
import dialogPolyfill
  from '/dependencies/module/dialog-polyfill/dist/dialog-polyfill.esm.js';
import {Page} from '../page/page.js';

/**
 * Initialise the dialog box.
 */
export function init() {
  const dialog = qs('#settings-dialog');
  dialogPolyfill.registerDialog(dialog);

  const form = qs('#settings-form');
  form.elements['autoscan'].max = AutoscanSliderToMins.length - 1;
  form.elements['threshold'].max = ThresholdSliderToChars.length - 1;

  $on(form.elements['autoscan'], 'input', ({target}) =>
    updateAutoscanDescription(target.value),
  );
  $on(form.elements['threshold'], 'input', ({target}) =>
    updateThresholdDescription(target.value),
  );
  $on(form.elements['scan-mode'], 'input', ({target}) =>
    updateModeUI(target.value),
  );

  $on(form, 'reset', () => dialog.close());
}

/**
 * Show the settings dialog for the specified Page.
 *
 * @param {Page} page - Page object to view.
 *
 * @returns {Promise} Promise that resolves with an object containing the
 * updated page settings.
 */
export function openPageDialog(page) {
  const dialog = qs('#settings-dialog');
  const form = qs('#settings-form');

  form.elements['title'].value = page.title;
  form.elements['url'].value = page.url;

  form.elements['selectors'].value = page.selectors;
  form.elements['ignored-selectors'].value = page.ignoredSelectors ?? '';

  const scanModeName = getScanModeName(page);
  form.elements['scan-mode'].value = scanModeName;
  updateModeUI(scanModeName);

  const autoscanSliderValue = autoscanMinsToSlider(page.scanRateMinutes);
  form.elements['autoscan'].value = autoscanSliderValue;
  updateAutoscanDescription(autoscanSliderValue);

  const thresholdSliderValue = thresholdCharsToSlider(page.changeThreshold);
  form.elements['threshold'].value = thresholdSliderValue;
  updateThresholdDescription(thresholdSliderValue);

  form.elements['ignore-numbers'].checked = page.ignoreNumbers;
  form.elements['hidden-tab-scan'].checked = page.useHiddenTabScan;
  form.elements['send-credentials'].checked = page.sendCredentials;
  form.elements['fetch-cache'].value = page.fetchCache ?? '';
  form.elements['fetch-mode'].value = page.fetchMode ?? '';
  form.elements['fetch-redirect'].value = page.fetchRedirect ?? '';
  form.elements['fetch-headers'].value = page.fetchHeaders ?? '';
  form.elements['text-diff-mode'].checked = page.textDiffMode ?? false;
  form.elements['wait-for-network-idle'].checked = page.waitForNetworkIdle ?? true;
  form.elements['wait-for-selector'].value = page.waitForSelector ?? '';
  form.elements['wait-for-selector-timeout'].value =
    formatOptionalNumber(page.waitForSelectorTimeoutMs);
  form.elements['wait-for-network-idle-timeout'].value =
    formatOptionalNumber(page.waitForNetworkIdleTimeoutMs);
  form.elements['hidden-tab-ignore-selectors'].value =
    page.hiddenTabIgnoreSelectors ?? '';
  form.elements['hidden-tab-text-hash'].checked =
    page.hiddenTabUseTextSnapshotHash ?? false;
  form.elements['hidden-tab-scroll-steps'].value =
    formatOptionalNumber(page.hiddenTabScrollSteps);
  form.elements['hidden-tab-scroll-delay-ms'].value =
    formatOptionalNumber(page.hiddenTabScrollDelayMs);
  form.elements['hidden-tab-scroll-max-height'].value =
    formatOptionalNumber(page.hiddenTabScrollMaxHeight);

  showElement(qs('#page-heading'));
  showElement(qs('#urlFieldset'));
  showElement(qs('#autoscanFieldset'));
  showElement(qs('#thresholdFieldset'));
  showElement(qs('#selectorsFieldset'));
  showElement(qs('#ignoredSelectorsFieldset'));
  showElement(qs('#scanModeFieldset'));
  showElement(qs('#scanSourceFieldset'));
  showElement(qs('#scanOptions'));

  hideElement(qs('#folder-heading'));

  dialog.showModal();

  return new Promise((resolve, reject) => {
    $on(dialog, 'close', () => {
      if (dialog.returnValue === 'ok') {
        const mode = form.elements['scan-mode'].value;
        const modeData = ScanModeMap.get(mode).options;
        resolve({
          title: form.elements['title'].value,
          url: form.elements['url'].value,
          scanRateMinutes:
            AutoscanSliderToMins[form.elements['autoscan'].value],
          changeThreshold:
            ThresholdSliderToChars[form.elements['threshold'].value],
          ignoreNumbers: form.elements['ignore-numbers'].checked,
          selectors: form.elements['selectors'].value,
          ignoredSelectors: form.elements['ignored-selectors'].value,
          contentMode: modeData.contentMode,
          requireExactMatchCount: modeData.requireExactMatchCount,
          partialScan: modeData.partialScan,
          useHiddenTabScan: form.elements['hidden-tab-scan'].checked,
          sendCredentials: form.elements['send-credentials'].checked,
          fetchCache: normalizeSelectValue(form.elements['fetch-cache'].value),
          fetchMode: normalizeSelectValue(form.elements['fetch-mode'].value),
          fetchRedirect: normalizeSelectValue(form.elements['fetch-redirect'].value),
          fetchHeaders: form.elements['fetch-headers'].value,
          textDiffMode: form.elements['text-diff-mode'].checked,
          waitForNetworkIdle: form.elements['wait-for-network-idle'].checked,
          waitForSelector: normalizeTextValue(
            form.elements['wait-for-selector'].value,
          ),
          waitForSelectorTimeoutMs: parseOptionalNumber(
            form.elements['wait-for-selector-timeout'].value,
          ),
          waitForNetworkIdleTimeoutMs: parseOptionalNumber(
            form.elements['wait-for-network-idle-timeout'].value,
          ),
          hiddenTabIgnoreSelectors:
            form.elements['hidden-tab-ignore-selectors'].value,
          hiddenTabUseTextSnapshotHash:
            form.elements['hidden-tab-text-hash'].checked,
          hiddenTabScrollSteps: parseOptionalNumber(
            form.elements['hidden-tab-scroll-steps'].value,
          ),
          hiddenTabScrollDelayMs: parseOptionalNumber(
            form.elements['hidden-tab-scroll-delay-ms'].value,
          ),
          hiddenTabScrollMaxHeight: parseOptionalNumber(
            form.elements['hidden-tab-scroll-max-height'].value,
          ),
        });
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Show the settings dialog for the specified PageFolder.
 *
 * @param {PageFolder} pageFolder - PageFolder object to view.
 *
 * @returns {Promise} Promise that resolves with an object containing the
 * updated pageFolder settings.
 */
export function openPageFolderDialog(pageFolder) {
  const dialog = qs('#settings-dialog');
  const form = qs('#settings-form');

  form.elements['title'].value = pageFolder.title;

  hideElement(qs('#page-heading'));
  hideElement(qs('#urlFieldset'));
  hideElement(qs('#autoscanFieldset'));
  hideElement(qs('#thresholdFieldset'));
  hideElement(qs('#selectorsFieldset'));
  hideElement(qs('#ignoredSelectorsFieldset'));
  hideElement(qs('#scanModeFieldset'));
  hideElement(qs('#scanSourceFieldset'));
  hideElement(qs('#scanOptions'));

  dialog.showModal();

  return new Promise((resolve, reject) => {
    $on(dialog, 'close', () => {
      if (dialog.returnValue === 'ok') {
        resolve({title: form.elements['title'].value});
      } else {
        resolve(null);
      }
    });
  });
}

const AutoscanSliderMap = new Map([
  [5, 'main.autoscan.every5'],
  [15, 'main.autoscan.every15'],
  [30, 'main.autoscan.every30'],
  [60, 'main.autoscan.every60'],
  [6 * 60, 'main.autoscan.every6hours'],
  [24 * 60, 'main.autoscan.every24hours'],
  [7 * 24 * 60, 'main.autoscan.everyWeek'],
  [0, 'main.autoscan.manual'],
]);
const AutoscanSliderToMins = [...AutoscanSliderMap.keys()];
const AutoscanSliderDescriptions = [...AutoscanSliderMap.values()];
const AutoscanSliderNever = AutoscanSliderToMins.indexOf(0);

/**
 * @param {number} minutes - Number of minutes between scans.
 *
 * @returns {number} Slider value representing the given number of minutes.
 */
function autoscanMinsToSlider(minutes) {
  if (minutes === 0) {
    return AutoscanSliderNever;
  }

  // Walk through the options, returning the first one that matches
  for (let i = 0; i < AutoscanSliderToMins.length; i++) {
    if (AutoscanSliderToMins[i] >= minutes) {
      return i;
    }
  }

  // Round down to 7 weeks
  return AutoscanSliderNever - 1;
}

/**
 * Update the Autoscan description text based on the current slider value.
 *
 * @param {number} sliderValue - Autoscan slider value.
 */
function updateAutoscanDescription(sliderValue) {
  qs('#settings-form').elements['autoscan-description'].value =
    translate(AutoscanSliderDescriptions[sliderValue]);
}

/**
 * Normalisiert Select-Werte, indem leere Strings zu null werden.
 *
 * @param {string} value - Select-Wert.
 * @returns {?string} Normalisierter Wert.
 */
function normalizeSelectValue(value) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

/**
 * Normalisiert Textwerte, indem leere Strings zu null werden.
 *
 * @param {string} value - Textwert.
 * @returns {?string} Normalisierter Textwert.
 */
function normalizeTextValue(value) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

/**
 * @param {?number} value - Optionaler Zahlenwert.
 * @returns {string} String-Wert für Eingabefelder.
 */
function formatOptionalNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * @param {string} value - Eingabewert.
 * @returns {?number} Zahl oder null.
 */
function parseOptionalNumber(value) {
  if (!value || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const ScanModeMap = new Map([
  ['anywhere', {
    descriptionKey: 'main.scanMode.description.anywhere',
    options: {
      partialScan: false,
      contentMode: Page.contentModeEnum.TEXT,
    },
  }],
  ['inside-elements', {
    descriptionKey: 'main.scanMode.description.insideElements',
    options: {
      partialScan: true,
      requireExactMatchCount: true,
      contentMode: Page.contentModeEnum.TEXT,
    },
  }],
  ['count-only', {
    descriptionKey: 'main.scanMode.description.countOnly',
    options: {
      partialScan: true,
      requireExactMatchCount: true,
      contentMode: Page.contentModeEnum.IGNORE,
    },
  }],
]);

/**
 * Updates UI based on the mode. Disables fields not allowed in the
 * mode and mode description.
 *
 * @param {string} modeName - Name of the current mode.
 */
function updateModeUI(modeName) {
  const mode = ScanModeMap.get(modeName);
  updateInputDisabledStates(mode);
  updateScanModeDescription(mode);
  updateSelectorsDescription(mode.options.partialScan);
}

/**
 * Updates input disabled states based on new mode.
 *
 * @param {object} mode - Scan mode.
 */
function updateInputDisabledStates(mode) {
  const form = qs('#settings-form');

  setDisableOnInput(form.elements['selectors'], !mode.options.partialScan);
  updateThresholdDisabledState(mode.options);
}

/**
 * Updates selector description.
 *
 * @param {boolean} partialScan - True if partial scan is enabled.
 */
function updateSelectorsDescription(partialScan) {
  const form = qs('#settings-form');
  const selectorsElement = form.elements['selectors'];
  if (partialScan) {
    selectorsElement.placeholder = '';
  } else {
    selectorsElement.placeholder = translate('main.selectors.unavailable');
  }
}

/**
 * Updates scan mode description.
 *
 * @param {object} mode - Scan mode.
 */
function updateScanModeDescription(mode) {
  const form = qs('#settings-form');
  const descriptionElement = form.elements['scan-mode-description'];
  descriptionElement.value = translate(mode.descriptionKey);
}

/**
 * Sets disabled on input or wrapper and all it's input children.
 *
 * @param {Element} parent - Parent element.
 * @param {boolean} disabled - True if input should be disabled.
 */
function setDisableOnInput(parent, disabled) {
  if (parent.tagName === 'INPUT') {
    parent.disabled = disabled;
  } else {
    const disabledClass = 'disabled';
    const hasRightClass =
      parent.classList.contains(disabledClass) === disabled;

    if (!hasRightClass) {
      if (disabled) {
        parent.classList.add(disabledClass);
      } else {
        parent.classList.remove(disabledClass);
      }
    }

    parent.querySelectorAll('input, select').forEach((node) => {
      node.disabled = disabled;
    });
  }
}

/**
 * Updates disabled state for threshold input.
 *
 * @param {object} modeOptions - Mode options.
 */
function updateThresholdDisabledState(modeOptions) {
  const thresholdFieldset = qs('#thresholdFieldset');
  thresholdFieldset.classList.remove('disabled');
  if (modeOptions.contentMode === Page.contentModeEnum.IGNORE) {
    setDisableOnInput(thresholdFieldset, true);
  } else {
    setDisableOnInput(thresholdFieldset, false);
  }
}


/**
 * Returns scan mode from page.
 *
 * @param {Page} page - Page.
 * @returns {string} Mode name.
 */
function getScanModeName(page) {
  const scanModeMapIterator = ScanModeMap.entries();
  for (const item of scanModeMapIterator) {
    const data = item[1];
    const options = data.options;
    let isEqual = true;
    for (const propertyName in options) {
      if (options[propertyName] !== page[propertyName]) {
        isEqual = false;
        break;
      }
    }

    if (isEqual) {
      return item[0];
    }
  }

  return ScanModeMap.keys().next().value;
}

const ThresholdSliderMap = new Map([
  [0, ['main.threshold.all', 'main.threshold.all.detail']],
  [10, ['main.threshold.cosmetic', 'main.threshold.cosmetic.detail']],
  [50, ['main.threshold.minor', 'main.threshold.minor.detail']],
  [100, ['main.threshold.small', 'main.threshold.small.detail']],
  [500, ['main.threshold.medium', 'main.threshold.medium.detail']],
  [1000, ['main.threshold.major', 'main.threshold.major.detail']],
]);
const ThresholdSliderToChars = [...ThresholdSliderMap.keys()];
const ThresholdSliderDescriptions = [...ThresholdSliderMap.values()];

/**
 * @param {number} changeThreshold - Change threshold measured in characters.
 *
 * @returns {number} Slider value representing the given number of characters.
 */
function thresholdCharsToSlider(changeThreshold) {
  // Walk through the options, returning the first one that matches
  for (let i = 0; i < ThresholdSliderToChars.length; i++) {
    if (ThresholdSliderToChars[i] >= changeThreshold) {
      return i;
    }
  }
  return thresholdCharsToSlider.length - 1;
}

/**
 * Update the Threshold description text based on the current slider value.
 *
 * @param {number} sliderValue - Threshold slider value.
 */
function updateThresholdDescription(sliderValue) {
  qs('#settings-form').elements['threshold-description'].value =
    translate(ThresholdSliderDescriptions[sliderValue][0]);
  qs('#settings-form').elements['threshold-subdescription'].value =
    translate(ThresholdSliderDescriptions[sliderValue][1]);
}
