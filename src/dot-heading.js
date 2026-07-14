/**
 * dot-heading.js
 * ---------------------------------------------------------------------------
 * Optional. Only needed if you don't want to hand-write data-text="..." on
 * every .dot-heading element in your markup.
 *
 * The CSS chromatic-aberration effect (see .dot-heading in global.css) reads
 * its red/blue ghost layers from `content: attr(data-text)`, so that
 * attribute has to hold the same text as the element itself. This copies it
 * over automatically once, on load, for any .dot-heading found in the DOM.
 *
 * Hook it in:
 *   - Vanilla / static site: <script type="module" src="/dot-heading.js"></script>
 *     right before </body>.
 *   - Vite / React / Vue entry file: import './dot-heading.js' once near the
 *     top of main.js/main.tsx (or call initDotHeadings() from a useEffect if
 *     headings mount after initial load, e.g. via client-side routing).
 */

export function initDotHeadings(root = document) {
  root.querySelectorAll('.dot-heading:not([data-text])').forEach((el) => {
    el.dataset.text = el.textContent.trim();
  });
}

// Auto-run on script load for the simple static-site case.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDotHeadings());
  } else {
    initDotHeadings();
  }
}
