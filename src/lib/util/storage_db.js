import {readAsText} from './promise.js';
import {getFileStorage} from
  '/dependencies/module/idb-file-storage/src/idb-file-storage.js';

/**
 * @returns {object} The storage object for UpdateScanner.
 */
let storagePromise = null;
let storageWriteChain = Promise.resolve();

/**
 * Stellt sicher, dass die IndexedDB nur einmal parallel geöffnet wird.
 *
 * @returns {Promise<object>} Storage-Instanz.
 */
async function _getStorage() {
  if (!storagePromise) {
    storagePromise = getFileStorage({name: 'updatescanner', persistent: true})
      .catch((error) => {
        storagePromise = null;
        throw error;
      });
  }
  return await storagePromise;
}

/**
 * @param {object} storage - Storage object.
 * @param {string} key - Storage key.
 *
 * @returns {bool} True if the specified key exists in storage.
 */
async function _keyExists(storage, key) {
  const count = await storage.count({filterFn: (name) => (name == key)});
  return count > 0;
}

/**
 * Static functions to save and load data from IndexedDB storage.
 * Use for large amounts of data (HTML pages).
 */
export class StorageDB {
  /**
   * Initialisiert die IndexedDB-Verbindung (idempotent).
   *
   * @returns {Promise<void>} Promise der Initialisierung.
   */
  static async ensureInitialized() {
    await _getStorage();
  }

  /**
   * Save an object to storage.
   *
   * @param {string} key - Storage key returned by _pageKey(), htmlKey(), etc.
   * @param {object} data - Object to save.
   */
  static async save(key, data) {
    return StorageDB._queueWrite('save', key, async () => {
      const storage = await _getStorage();
      const blob = new Blob([data]);
      await storage.put(key, blob);
    });
  }

  /**
   * Load an object from storage.
   *
   * @param {string} key - Storage key corresponding to an object in storage.
   *
   * @returns {Promise} A promise that will be fulfilled with the requested
   * object. If the object doesn't exist, the promise returns undefined.
   * If the operation fails, the promise will be rejected.
   */
  static async load(key) {
    const storage = await _getStorage();
    if (!await _keyExists(storage, key)) {
      return undefined;
    }
    const blob = await storage.get(key);
    return await readAsText(blob);
  }

  /**
   * Deletes an item from storage.
   *
   * @param {string} key - Storage key of the object to delete.
   */
  static async remove(key) {
    return StorageDB._queueWrite('remove', key, async () => {
      const storage = await _getStorage();
      await storage.remove(key);
    });
  }

  /**
   * Stellt sicher, dass Schreibzugriffe seriell ausgeführt werden.
   *
   * @param {string} action - Schreibaktion zur Protokollierung.
   * @param {string} key - Storage-Key.
   * @param {Function} writeFn - Auszuführende Schreibfunktion.
   *
   * @returns {Promise<void>} Promise für die Schreiboperation.
   */
  static _queueWrite(action, key, writeFn) {
    storageWriteChain = storageWriteChain.then(writeFn, writeFn);
    storageWriteChain = storageWriteChain.catch((error) => {
      StorageDB._logWriteError(action, key, error);
    });
    return storageWriteChain;
  }

  /**
   * Loggt Speicherfehler mit Kontext, ohne den Ablauf abzubrechen.
   *
   * @param {string} action - Schreibaktion.
   * @param {string} key - Storage-Key.
   * @param {Error} error - Fehlerobjekt.
   */
  static _logWriteError(action, key, error) {
    const isQuotaError = error && error.name === 'QuotaExceededError';
    const reason = isQuotaError ? 'Quota überschritten' : 'Speicherfehler';
    console.error(`${reason} bei IndexedDB ${action} (${key}).`, error);
  }
}
