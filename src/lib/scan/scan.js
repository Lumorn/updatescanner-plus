import {Config} from '/lib/util/config.js';
import * as legacyScan from './scan_legacy.js';
import * as newScan from './scan_new.js';

const scanEngineEnum = {
  LEGACY: 'legacy',
  NEW: 'new',
};

/**
 * Lädt das aktuelle Scan-Modul basierend auf der Konfiguration.
 *
 * @returns {Promise<object>} Aktives Scan-Modul.
 */
async function getScanModule() {
  const configuredMode = await Config.loadSingleSetting('scanEngineMode');
  if (configuredMode === scanEngineEnum.NEW) {
    return newScan;
  }
  return legacyScan;
}

/**
 * Startet den Scan für alle Seiten mit dem aktiven Scan-Modus.
 *
 * @param {Array.<Page>} pageList - Liste der zu scannenden Seiten.
 *
 * @returns {number} Anzahl der neu erkannten Hauptänderungen.
 */
export async function scan(pageList) {
  const scanModule = await getScanModule();
  return scanModule.scan(pageList);
}

/**
 * Scannt eine einzelne Seite mit dem aktiven Scan-Modus.
 *
 * @param {Page} page - Zu scannende Seite.
 *
 * @returns {boolean} True, wenn eine neue Hauptänderung erkannt wurde.
 */
export async function scanPage(page) {
  const scanModule = await getScanModule();
  return scanModule.scanPage(page);
}

export const __ = {
  getScanModule: () => getScanModule(),
};
