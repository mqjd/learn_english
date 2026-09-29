/**
 * Floating TOC FAB visibility API for page chrome.
 * No-op when the page has no `[data-toc-rail]` (default Starlight layout).
 * @param {boolean} visible
 */
export function setTocFabVisible(visible) {
	document.querySelectorAll('[data-toc-rail]').forEach((el) => {
		if (!(el instanceof HTMLElement)) return
		el.hidden = !visible
	})
}
