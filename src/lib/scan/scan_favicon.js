/**
 * Ermittelt eine Favicon-URL aus dem HTML oder nutzt ein Standard-Fallback.
 *
 * @param {?string} pageUrl - URL der gescannten Seite.
 * @param {?string} html - HTML-Quelle der Seite.
 * @returns {?string} Aufgelöste Favicon-URL oder null.
 */
export function resolveFaviconUrl(pageUrl, html) {
  if (!pageUrl) {
    return null;
  }

  const fallbackUrl = buildFallbackFaviconUrl(pageUrl);
  if (!html) {
    return fallbackUrl;
  }

  try {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const iconLink = dom.querySelector(
      'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]',
    );
    const href = iconLink?.getAttribute('href')?.trim();
    if (!href) {
      return fallbackUrl;
    }
    return new URL(href, pageUrl).toString();
  } catch (error) {
    return fallbackUrl;
  }
}

/**
 * Baut eine Standard-Fallback-URL auf /favicon.ico.
 *
 * @param {string} pageUrl - URL der Seite.
 * @returns {?string} Fallback-URL oder null.
 */
function buildFallbackFaviconUrl(pageUrl) {
  try {
    return new URL('/favicon.ico', pageUrl).toString();
  } catch (error) {
    return null;
  }
}
