import {qs, $on, hideElement, showElement} from '/lib/util/view_helpers.js';
import {translate} from '/lib/util/i18n.js';
import {Config} from '/lib/util/config.js';

// See https://bugzilla.mozilla.org/show_bug.cgi?id=840640
import dialogPolyfill
  from '/dependencies/module/dialog-polyfill/dist/dialog-polyfill.esm.js';
import {Page} from '../page/page.js';

const ScanEngineMode = {
  LEGACY: 'legacy',
  NEW: 'new',
};

const PagePreset = {
  CUSTOM: 'custom',
  STATIC: 'static',
  DYNAMIC: 'dynamic',
};

let currentScanEngineMode = ScanEngineMode.LEGACY;
let currentDialogType = 'page';

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
  $on(form.elements['scan-engine'], 'input', async ({target}) => {
    if (!target.value) {
      return;
    }
    await persistScanEngineMode(target.value);
    setScanEngineMode(target.value);
  });
  $on(form.elements['page-preset'], 'input', ({target}) => {
    if (!target.value) {
      return;
    }
    applyPresetSelection(target.value, form);
  });

  $on(form, 'reset', () => dialog.close());
  $on(form, 'submit', (event) => {
    if (currentDialogType !== 'page') {
      return;
    }
    const isValid = validatePageForm(form);
    if (!isValid) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

/**
 * Show the settings dialog for the specified Page.
 *
 * @param {Page} page - Page object to view.
 *
 * @returns {Promise} Promise that resolves with an object containing the
 * updated page settings.
 */
export async function openPageDialog(page) {
  const dialog = qs('#settings-dialog');
  const form = qs('#settings-form');

  currentDialogType = 'page';
  const scanEngineMode =
    (await Config.loadSingleSetting('scanEngineMode')) ??
    ScanEngineMode.LEGACY;
  form.elements['scan-engine'].value = scanEngineMode;

  form.elements['title'].value = page.title;
  form.elements['url'].value = page.url;

  form.elements['selectors'].value = page.selectors;
  form.elements['area-selector'].value = page.areaSelector ?? '';
  form.elements['ignored-selectors'].value = page.ignoredSelectors ?? '';
  form.elements['filter-regex-list'].value = page.filterRegexList ?? '';
  form.elements['attribute-blacklist'].value = page.attributeBlacklist ?? '';
  form.elements['page-preset'].value = PagePreset.CUSTOM;
  resetValidationState();

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
  form.elements['min-change-chars'].value = formatOptionalNumber(page.minChangeChars);
  form.elements['min-change-words'].value = formatOptionalNumber(page.minChangeWords);
  form.elements['levenshtein-threshold'].value =
    formatOptionalNumber(page.levenshteinThreshold);
  form.elements['scan-source-mode'].value =
    page.scanSourceMode ?? (page.useHiddenTabScan ? 'headless' : 'http');
  form.elements['send-credentials'].checked = page.sendCredentials;
  form.elements['fetch-cache'].value = page.fetchCache ?? '';
  form.elements['fetch-mode'].value = page.fetchMode ?? '';
  form.elements['fetch-redirect'].value = page.fetchRedirect ?? '';
  form.elements['fetch-headers'].value = page.fetchHeaders ?? '';
  form.elements['headless-wait-strategy'].value =
    page.headlessWaitStrategy ?? 'network-idle';
  form.elements['diff-type'].value = page.diffType ?? Page.DEFAULTS.diffType;
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
  showElement(qs('#scanEngineFieldset'));
  showElement(qs('#urlFieldset'));
  showElement(qs('#autoscanFieldset'));
  showElement(qs('#thresholdFieldset'));
  showElement(qs('#presetFieldset'));
  showElement(qs('#selectorsFieldset'));
  showElement(qs('#areaSelectorFieldset'));
  showElement(qs('#ignoredSelectorsFieldset'));
  showElement(qs('#filterFieldset'));
  showElement(qs('#scanModeFieldset'));
  showElement(qs('#scanSourceFieldset'));
  showElement(qs('#scanOptions'));

  hideElement(qs('#folder-heading'));
  setScanEngineMode(scanEngineMode);

  dialog.showModal();

  return new Promise((resolve, reject) => {
    $on(dialog, 'close', () => {
      if (dialog.returnValue === 'ok') {
        const mode = form.elements['scan-mode'].value;
        const modeData = ScanModeMap.get(mode).options;
        let settings = {
          title: form.elements['title'].value,
          url: form.elements['url'].value,
          scanRateMinutes:
            AutoscanSliderToMins[form.elements['autoscan'].value],
          changeThreshold:
            ThresholdSliderToChars[form.elements['threshold'].value],
          ignoreNumbers: form.elements['ignore-numbers'].checked,
          minChangeChars: parseNonNegativeNumber(
            form.elements['min-change-chars'].value,
          ),
          minChangeWords: parseNonNegativeNumber(
            form.elements['min-change-words'].value,
          ),
          levenshteinThreshold: parseRatioValue(
            form.elements['levenshtein-threshold'].value,
          ),
          selectors: form.elements['selectors'].value,
          areaSelector: normalizeTextValue(
            form.elements['area-selector'].value,
          ),
          ignoredSelectors: form.elements['ignored-selectors'].value,
          filterRegexList: normalizeTextValue(
            form.elements['filter-regex-list'].value,
          ),
          attributeBlacklist: normalizeTextValue(
            form.elements['attribute-blacklist'].value,
          ),
          contentMode: modeData.contentMode,
          requireExactMatchCount: modeData.requireExactMatchCount,
          partialScan: modeData.partialScan,
          scanSourceMode: form.elements['scan-source-mode'].value,
          useHiddenTabScan: form.elements['scan-source-mode'].value === 'headless',
          sendCredentials: form.elements['send-credentials'].checked,
          fetchCache: normalizeSelectValue(form.elements['fetch-cache'].value),
          fetchMode: normalizeSelectValue(form.elements['fetch-mode'].value),
          fetchRedirect: normalizeSelectValue(form.elements['fetch-redirect'].value),
          fetchHeaders: form.elements['fetch-headers'].value,
          headlessWaitStrategy: form.elements['headless-wait-strategy'].value,
          diffType: form.elements['diff-type'].value,
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
        };
        settings = applyLegacyDefaults(settings);
        resolve(settings);
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
export async function openPageFolderDialog(pageFolder) {
  const dialog = qs('#settings-dialog');
  const form = qs('#settings-form');

  currentDialogType = 'folder';
  const scanEngineMode =
    (await Config.loadSingleSetting('scanEngineMode')) ??
    ScanEngineMode.LEGACY;
  form.elements['scan-engine'].value = scanEngineMode;

  form.elements['title'].value = pageFolder.title;

  hideElement(qs('#page-heading'));
  showElement(qs('#scanEngineFieldset'));
  hideElement(qs('#urlFieldset'));
  hideElement(qs('#autoscanFieldset'));
  hideElement(qs('#thresholdFieldset'));
  hideElement(qs('#presetFieldset'));
  hideElement(qs('#selectorsFieldset'));
  hideElement(qs('#areaSelectorFieldset'));
  hideElement(qs('#ignoredSelectorsFieldset'));
  hideElement(qs('#filterFieldset'));
  hideElement(qs('#scanModeFieldset'));
  hideElement(qs('#scanSourceFieldset'));
  hideElement(qs('#scanOptions'));

  setScanEngineMode(scanEngineMode);
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

/**
 * Normalisiert eine Zahl auf >= 0, leere Eingaben werden 0.
 *
 * @param {string} value - Eingabewert.
 * @returns {number} Normalisierter Zahlenwert.
 */
function parseNonNegativeNumber(value) {
  if (!value || value.trim() === '') {
    return 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

/**
 * Normalisiert eine Ratio in den Bereich 0..1, leere Eingaben werden 0.
 *
 * @param {string} value - Eingabewert.
 * @returns {number} Normalisierte Ratio.
 */
function parseRatioValue(value) {
  if (!value || value.trim() === '') {
    return 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, parsed));
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

const PresetDefinitions = new Map([
  [PagePreset.STATIC, {
    scanMode: 'anywhere',
    scanSourceMode: 'http',
    fetchMode: '',
    diffType: Page.diffTypeEnum.HTML,
    changeThreshold: 10,
    ignoreNumbers: false,
    minChangeChars: 0,
    minChangeWords: 0,
    levenshteinThreshold: 0,
    headlessWaitStrategy: 'network-idle',
    waitForNetworkIdle: true,
  }],
  [PagePreset.DYNAMIC, {
    scanMode: 'anywhere',
    scanSourceMode: 'headless',
    fetchMode: '',
    diffType: Page.diffTypeEnum.TEXT,
    changeThreshold: 500,
    ignoreNumbers: true,
    minChangeChars: 5,
    minChangeWords: 1,
    levenshteinThreshold: 0.15,
    headlessWaitStrategy: 'network-idle',
    waitForNetworkIdle: true,
  }],
]);

function setScanEngineMode(modeName) {
  currentScanEngineMode = modeName;
  updateScanEngineUI(modeName);
}

function updateScanEngineUI(modeName) {
  const showAdvanced =
    currentDialogType === 'page' && modeName === ScanEngineMode.NEW;
  if (showAdvanced) {
    showElement(qs('#scanSourceFieldset'));
    showElement(qs('#scanOptions'));
  } else {
    hideElement(qs('#scanSourceFieldset'));
    hideElement(qs('#scanOptions'));
  }
}

async function persistScanEngineMode(modeName) {
  const config = await new Config().load();
  config.set('scanEngineMode', modeName);
  await config.save();
}

function applyLegacyDefaults(settings) {
  if (currentScanEngineMode !== ScanEngineMode.LEGACY) {
    return settings;
  }
  return {
    ...settings,
    useHiddenTabScan: false,
    sendCredentials: false,
    fetchCache: null,
    fetchMode: null,
    fetchRedirect: null,
    fetchHeaders: '',
    scanSourceMode: 'http',
    headlessWaitStrategy: 'network-idle',
    diffType: Page.DEFAULTS.diffType,
    waitForNetworkIdle: false,
    waitForSelector: null,
    waitForSelectorTimeoutMs: null,
    waitForNetworkIdleTimeoutMs: null,
    hiddenTabIgnoreSelectors: '',
    hiddenTabUseTextSnapshotHash: false,
    hiddenTabScrollSteps: null,
    hiddenTabScrollDelayMs: null,
    hiddenTabScrollMaxHeight: null,
  };
}

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
  clearSelectorsValidation();
}

/**
 * Wendet ein Preset auf die Formularfelder an.
 *
 * @param {string} presetName - Name des Presets.
 * @param {HTMLFormElement} form - Einstellungsformular.
 */
function applyPresetSelection(presetName, form) {
  if (presetName === PagePreset.CUSTOM) {
    return;
  }
  const preset = PresetDefinitions.get(presetName);
  if (!preset) {
    return;
  }

  form.elements['scan-mode'].value = preset.scanMode;
  updateModeUI(preset.scanMode);

  form.elements['scan-source-mode'].value = preset.scanSourceMode;
  form.elements['fetch-mode'].value = preset.fetchMode ?? '';
  form.elements['diff-type'].value = preset.diffType;

  const thresholdValue = thresholdCharsToSlider(preset.changeThreshold);
  form.elements['threshold'].value = thresholdValue;
  updateThresholdDescription(thresholdValue);

  form.elements['ignore-numbers'].checked = preset.ignoreNumbers;
  form.elements['min-change-chars'].value = preset.minChangeChars;
  form.elements['min-change-words'].value = preset.minChangeWords;
  form.elements['levenshtein-threshold'].value = preset.levenshteinThreshold;
  form.elements['headless-wait-strategy'].value = preset.headlessWaitStrategy;
  form.elements['wait-for-network-idle'].checked = preset.waitForNetworkIdle;
  form.elements['selectors'].value = '';
  form.elements['fetch-headers'].value = '';

  resetValidationState();
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
 * Entfernt die Validierungsmarkierung für die Selektoren.
 */
function clearSelectorsValidation() {
  const selectorsError = qs('#selectors-error');
  if (selectorsError) {
    hideElement(selectorsError);
  }
  const selectorsInput = qs('#settings-form').elements['selectors'];
  if (selectorsInput) {
    selectorsInput.removeAttribute('aria-invalid');
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
 * Setzt alle Validierungsmeldungen zurück.
 */
function resetValidationState() {
  const errorIds = [
    '#url-error',
    '#selectors-error',
    '#fetch-headers-error',
    '#min-change-chars-error',
    '#min-change-words-error',
    '#levenshtein-threshold-error',
  ];
  errorIds.forEach((selector) => {
    const element = qs(selector);
    if (element) {
      hideElement(element);
    }
  });

  const form = qs('#settings-form');
  [
    'url',
    'selectors',
    'fetch-headers',
    'min-change-chars',
    'min-change-words',
    'levenshtein-threshold',
  ].forEach((name) => {
    const input = form.elements[name];
    if (input) {
      input.removeAttribute('aria-invalid');
    }
  });
}

/**
 * Validiert die Seiteneinstellungen.
 *
 * @param {HTMLFormElement} form - Einstellungsformular.
 * @returns {boolean} True, wenn das Formular gültig ist.
 */
function validatePageForm(form) {
  resetValidationState();

  let isValid = true;
  const invalidInputs = [];

  const urlValue = form.elements['url'].value?.trim();
  if (!isValidHttpUrl(urlValue)) {
    showElement(qs('#url-error'));
    markInvalid(form.elements['url']);
    invalidInputs.push(form.elements['url']);
    isValid = false;
  }

  const modeName = form.elements['scan-mode'].value;
  const mode = ScanModeMap.get(modeName);
  const needsSelectors = mode?.options?.partialScan;
  const selectorsValue = normalizeTextValue(form.elements['selectors'].value);
  if (needsSelectors && !selectorsValue) {
    showElement(qs('#selectors-error'));
    markInvalid(form.elements['selectors']);
    invalidInputs.push(form.elements['selectors']);
    isValid = false;
  }

  if (!areFetchHeadersValid(form.elements['fetch-headers'].value)) {
    showElement(qs('#fetch-headers-error'));
    markInvalid(form.elements['fetch-headers']);
    invalidInputs.push(form.elements['fetch-headers']);
    isValid = false;
  }

  if (!isValidNonNegativeNumber(form.elements['min-change-chars'].value)) {
    showElement(qs('#min-change-chars-error'));
    markInvalid(form.elements['min-change-chars']);
    invalidInputs.push(form.elements['min-change-chars']);
    isValid = false;
  }

  if (!isValidNonNegativeNumber(form.elements['min-change-words'].value)) {
    showElement(qs('#min-change-words-error'));
    markInvalid(form.elements['min-change-words']);
    invalidInputs.push(form.elements['min-change-words']);
    isValid = false;
  }

  if (!isValidRatioNumber(form.elements['levenshtein-threshold'].value)) {
    showElement(qs('#levenshtein-threshold-error'));
    markInvalid(form.elements['levenshtein-threshold']);
    invalidInputs.push(form.elements['levenshtein-threshold']);
    isValid = false;
  }

  if (!isValid && invalidInputs.length > 0) {
    invalidInputs[0].focus();
  }

  return isValid;
}

/**
 * Markiert ein Feld als ungültig.
 *
 * @param {HTMLElement} input - Eingabefeld.
 */
function markInvalid(input) {
  if (!input) {
    return;
  }
  input.setAttribute('aria-invalid', 'true');
}

/**
 * Prüft, ob eine URL gültig ist.
 *
 * @param {string} value - URL-String.
 * @returns {boolean} True, wenn die URL gültig ist.
 */
function isValidHttpUrl(value) {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Prüft Fetch-Header auf das Format "Name: Wert".
 *
 * @param {string} value - Header-String.
 * @returns {boolean} True bei gültigen Headern.
 */
function areFetchHeadersValid(value) {
  if (!value || value.trim() === '') {
    return true;
  }
  return value.split('\n').every((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return true;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) {
      return false;
    }
    const headerName = trimmed.slice(0, colonIndex).trim();
    const headerValue = trimmed.slice(colonIndex + 1).trim();
    return Boolean(headerName) && Boolean(headerValue);
  });
}

/**
 * Prüft eine nicht-negative Zahl (oder leere Eingabe).
 *
 * @param {string} value - Eingabewert.
 * @returns {boolean} True bei gültigem Wert.
 */
function isValidNonNegativeNumber(value) {
  if (!value || value.trim() === '') {
    return true;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

/**
 * Prüft eine Ratio im Bereich 0..1 (oder leere Eingabe).
 *
 * @param {string} value - Eingabewert.
 * @returns {boolean} True bei gültigem Wert.
 */
function isValidRatioNumber(value) {
  if (!value || value.trim() === '') {
    return true;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1;
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
