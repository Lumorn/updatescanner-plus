const fs = require('fs');
const os = require('os');
const path = require('path');
const webExt = require('web-ext').default;

const SOURCE_DIR = 'src';

/**
 * Bereitet ein Lint-Quellverzeichnis vor und liefert Cleanup-Logik zurück.
 *
 * @returns {{sourceDir: string, cleanup: Function}} Pfad zum Lint-Quellordner
 * und eine Cleanup-Funktion.
 */
function prepareLintSource() {
  const manifestPath = path.join(SOURCE_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const cleanup = () => {};

  if (manifest.manifest_version < 3) {
    return {sourceDir: SOURCE_DIR, cleanup};
  }

  // Workaround: web-ext 4.x kann MV3-Manifest-Versionen nicht linten.
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'web-ext-lint-'));
  fs.cpSync(SOURCE_DIR, tempDir, {recursive: true});

  const lintManifest = {
    manifest_version: 2,
    name: manifest.name || 'Update Scanner',
    version: manifest.version || '0.0.0',
  };

  fs.writeFileSync(
    path.join(tempDir, 'manifest.json'),
    `${JSON.stringify(lintManifest, null, 2)}\n`,
  );

  return {
    sourceDir: tempDir,
    cleanup: () => fs.rmSync(tempDir, {recursive: true, force: true}),
  };
}

exports.build = function() {
  console.log('Running "web-ext build"...');
  return webExt.cmd.build({
    sourceDir: SOURCE_DIR,
    artifactsDir: 'dist',
    overwriteDest: true,
  });
};

exports.lint = function() {
  console.log('Running web-ext lint...');
  const {sourceDir, cleanup} = prepareLintSource();
  return webExt.cmd.lint({
    sourceDir: sourceDir,
  }, {
    shouldExitProgram: false,
  }).finally(() => cleanup());
};

exports.run = function() {
  console.log('Running "web-ext run"...');
  return webExt.cmd.run({
    sourceDir: path.resolve(SOURCE_DIR),
    pref: 'javascript.options.strict=false',
  });
};

exports.sign = function(addonId, apiKey, apiSecret) {
  console.log('Running "web-ext sign"...');
  return webExt.cmd.sign({
    sourceDir: 'src',
    artifactsDir: 'dist',
    id: addonId,
    apiKey: apiKey,
    apiSecret: apiSecret,
    channel: 'unlisted',
  });
};
