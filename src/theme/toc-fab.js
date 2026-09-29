/**
 * Theme TOC FAB visibility API.
 * Delegates to `<theme-toc-fab>` custom elements (see TwoColumnContent.astro).
 * @param {boolean} visible
 */
export function setTocFabVisible(visible) {
	document.querySelectorAll('theme-toc-fab').forEach((el) => {
		if (typeof el.setVisible === 'function') {
			el.setVisible(visible)
		}
	})
}
