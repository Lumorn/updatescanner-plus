import {normalizeHtmlToText} from '/lib/util/html.js';
import {Page} from '/lib/page/page.js';
import * as scanContentModule from '/lib/scan/scan_content.js';
import {ContentData} from '/lib/scan/scan_content.js';

describe('scan_content fixtures', function() {
  beforeEach(function() {
    jasmine.getFixtures().fixturesPath = 'base/test/unit/fixtures';
  });

  describe('normalisierung', function() {
    it('normalisiert dynamische Inhalte mit Regex-Filtern', function() {
      const html = readFixtures('dynamic_before.html');
      const result = normalizeHtmlToText(html, {
        regexFilters: [
          /\d{4}-\d{2}-\d{2}/g,
          /\d{2}:\d{2}/g,
          /Zähler:\s*\d+/g,
        ],
      });

      expect(result.normalizedContent)
        .toEqual('Monitoring Bericht Status zuletzt aktualisiert: Hinweis: Statisch');
    });
  });

  describe('diff-strategien', function() {
    it('liefert den HTML-Diff-Modus', function() {
      const prevHtml = readFixtures('static_before.html');
      const nextHtml = readFixtures('static_after.html');
      const page = new Page('test', {diffType: Page.diffTypeEnum.HTML});

      const result = scanContentModule.getDiffResult(
        new ContentData(prevHtml),
        new ContentData(nextHtml),
        page,
      );

      expect(result.diffResult.mode)
        .toEqual(scanContentModule.diffModeEnum.HTML);
    });

    it('liefert den Text-Diff-Modus', function() {
      const prevHtml = readFixtures('static_before.html');
      const nextHtml = readFixtures('static_after.html');
      const page = new Page('test', {diffType: Page.diffTypeEnum.TEXT});

      const result = scanContentModule.getDiffResult(
        new ContentData(prevHtml),
        new ContentData(nextHtml),
        page,
      );

      expect(result.diffResult.mode)
        .toEqual(scanContentModule.diffModeEnum.TEXT);
    });

    it('liefert den DOM-Diff-Modus mit gefilterter Änderung', function() {
      const prevHtml = readFixtures('dynamic_before.html');
      const nextHtml = readFixtures('dynamic_after.html');
      const page = new Page('test', {
        domDiffMode: true,
        filterRegexList: 'Zähler:\\d+,\\d{4}-\\d{2}-\\d{2},\\d{2}:\\d{2}',
        contentMode: Page.contentModeEnum.HTML,
      });

      const result = scanContentModule.getDiffResult(
        new ContentData(prevHtml),
        new ContentData(nextHtml),
        page,
        {mode: scanContentModule.diffModeEnum.DOM, changes: [{type: 'text'}]},
      );

      expect(result.diffResult.mode)
        .toEqual(scanContentModule.diffModeEnum.DOM);
      expect(result.changeType)
        .toEqual(scanContentModule.changeEnum.MINOR_CHANGE);
    });
  });

  describe('filter', function() {
    it('entfernt Filtereinträge aus dem bereinigten HTML', function() {
      const html = readFixtures('static_before.html');

      const result = scanContentModule.__.stripHtml(
        html,
        false,
        true,
        'Beschreibung:Stabilundrobust\\.',
      );

      expect(result).not.toContain('Beschreibung:Stabilundrobust.');
      expect(result).toContain('ProduktseitePreis:19,99€');
    });
  });
});
