/**
 * Synchronous first-paint boot (inlined via is:inline).
 * Mirrors React useLayoutEffect: measure + reveal before the browser paints
 * the collapsed 10px-row grid state.
 */
;(function () {
	var PADDING_HEIGHT = 30
	var ROW_STRIDE = 30
	var ROW_GAP = 20
	var IMAGE_WAIT_MS = 800

	function measureItem(item) {
		var title = item.querySelector('[data-masonry-title]')
		var content = item.querySelector('[data-masonry-content]')
		if (!content) return
		var titleH = title ? title.offsetHeight : 0
		var titleMarginBottom = 0
		if (title) {
			titleMarginBottom = parseFloat(getComputedStyle(title).marginBottom) || 0
		}
		var totalHeight = titleH + titleMarginBottom + content.offsetHeight + PADDING_HEIGHT
		var span = Math.max(1, Math.ceil((totalHeight + ROW_GAP) / ROW_STRIDE))
		item.style.gridRowEnd = 'span ' + span
	}

	function measureRoot(root) {
		root.querySelectorAll('.masonry-item').forEach(measureItem)
	}

	function revealRoot(root) {
		root.querySelectorAll('.masonry-grid').forEach(function (grid) {
			grid.classList.add('is-ready')
		})
		root.setAttribute('data-masonry-boot', 'done')
	}

	function pendingImages(root) {
		return Array.prototype.filter.call(root.querySelectorAll('.masonry-item img'), function (img) {
			return !img.complete
		})
	}

	function bootRoot(root) {
		if (root.getAttribute('data-masonry-boot') === 'done') return
		measureRoot(root)

		var imgs = pendingImages(root)
		if (imgs.length === 0) {
			revealRoot(root)
			return
		}

		var left = imgs.length
		var finished = false
		function finish() {
			if (finished) return
			finished = true
			measureRoot(root)
			revealRoot(root)
		}
		function onOne() {
			measureRoot(root)
			left -= 1
			if (left <= 0) finish()
		}
		imgs.forEach(function (img) {
			img.addEventListener('load', onOne, { once: true })
			img.addEventListener('error', onOne, { once: true })
		})
		setTimeout(finish, IMAGE_WAIT_MS)
	}

	function bootAll() {
		document.querySelectorAll('[data-masonry-root]').forEach(bootRoot)
	}

	bootAll()
	document.addEventListener('astro:page-load', bootAll)
})()
