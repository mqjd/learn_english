import { setTocFabVisible } from '../../../theme/toc-fab.js'

const PADDING_HEIGHT = 30
/** grid-auto-rows: 10px + gap: 20px ⇒ span N ≈ 30N - 20 */
const ROW_STRIDE = 30
const ROW_GAP = 20

function vocabularyKey() {
	const suffix = 'vocabulary'
	if (typeof window === 'undefined') return suffix
	const path = window.location.pathname
	return path.endsWith('/') ? path + suffix : path + '/' + suffix
}

function readHistorical(key) {
	try {
		return JSON.parse(localStorage.getItem(key) || '{}')
	} catch {
		return {}
	}
}

function measureItem(item) {
	const title = item.querySelector('[data-masonry-title]')
	const content = item.querySelector('[data-masonry-content]')
	if (!content) return

	// Measure intrinsic content height (card no longer stretches with the grid area).
	const titleH = title?.offsetHeight || 0
	const titleMarginBottom = title
		? parseFloat(getComputedStyle(title).marginBottom) || 0
		: 0
	const contentH = content.offsetHeight
	const totalHeight = titleH + titleMarginBottom + contentH + PADDING_HEIGHT
	// span N occupies ≈ 30N - 20 px in this grid (10px rows + 20px gap).
	const span = Math.max(1, Math.ceil((totalHeight + ROW_GAP) / ROW_STRIDE))
	item.style.gridRowEnd = `span ${span}`
}

function measureAll(root) {
	root.querySelectorAll('.masonry-item').forEach((item) => {
		if (!(item instanceof HTMLElement)) return
		measureItem(item)
		item.querySelectorAll('img').forEach((img) => {
			if (img.complete) return
			img.addEventListener('load', () => measureItem(item), { once: true })
			img.addEventListener('error', () => measureItem(item), { once: true })
		})
	})
}

function revealGrids(root) {
	root.querySelectorAll('.masonry-grid').forEach((grid) => {
		grid.classList.add('is-ready')
	})
}

/**
 * @param {HTMLElement} root
 */
export function initMasonryStudy(root) {
	const itemCount = Number(root.dataset.itemCount) || 0
	const studyAvailable = root.dataset.useStudyMode === 'true'
	const toolbar = root.querySelector('[data-masonry-toolbar]')
	const defaultView = root.querySelector('[data-masonry-default]')
	const studyView = root.querySelector('[data-masonry-study-view]')
	const studyGrid = root.querySelector('[data-masonry-study-grid]')

	if (toolbar) toolbar.hidden = !studyAvailable

	const storageKey = vocabularyKey()
	/** @type {Record<number, boolean>} */
	let masonryItemState = {}
	/** @type {Record<number, number>} */
	let historicalMasonryItem = readHistorical(storageKey)

	let studyOn = false
	let historicalOnly = false
	let currentErrorsOnly = false
	let successCount = 0
	let failedCount = 0

	// Ensure TOC FAB is visible when this page boots (Study Mode starts off)
	setTocFabVisible(true)

	/** @type {Map<HTMLElement, HTMLElement>} item → original .masonry-grid parent */
	const originalParent = new Map()
	/** @type {HTMLElement[]} */
	let trackedStudyItems = []

	function collectStudyItemsFromBlocks() {
		return Array.from(
			root.querySelectorAll(
				'[data-masonry-block][data-use-study-mode="true"] .masonry-item',
			),
		).filter((el) => el instanceof HTMLElement)
	}

	function collectStudyItemsFromGrid() {
		if (!(studyGrid instanceof HTMLElement)) return []
		return Array.from(studyGrid.querySelectorAll('.masonry-item')).filter(
			(el) => el instanceof HTMLElement,
		)
	}

	function studyItems() {
		if (trackedStudyItems.length > 0) {
			return trackedStudyItems.filter((el) => el.isConnected)
		}
		if (studyOn) return collectStudyItemsFromGrid()
		return collectStudyItemsFromBlocks()
	}

	function updateScore() {
		const remaining = itemCount - successCount - failedCount
		const remainingEl = root.querySelector('[data-score-remaining]')
		const successEl = root.querySelector('[data-score-success]')
		const failedEl = root.querySelector('[data-score-failed]')
		if (remainingEl) remainingEl.textContent = String(remaining)
		if (successEl) successEl.textContent = `-${successCount}`
		if (failedEl) failedEl.textContent = `-${failedCount}`
	}

	function setAdvancedVisible(visible) {
		root.querySelectorAll('[data-advanced-only]').forEach((el) => {
			if (el instanceof HTMLElement) el.hidden = !visible
		})
		const scoreLabel = root.querySelector('[data-score-label]')
		const scoreDetail = root.querySelector('[data-score-detail]')
		if (scoreLabel instanceof HTMLElement) scoreLabel.hidden = !visible
		if (scoreDetail instanceof HTMLElement) scoreDetail.hidden = !visible
	}

	function applyItemUi(item) {
		const index = Number(item.dataset.index)
		const state = masonryItemState[index]
		const title = item.querySelector('[data-masonry-title]')
		const skeleton = item.querySelector('[data-masonry-skeleton]')
		const mark = item.querySelector('[data-masonry-mark]')

		title?.classList.remove('is-success', 'is-failure')
		if (skeleton instanceof HTMLElement) skeleton.hidden = true
		if (mark instanceof HTMLElement) mark.hidden = true

		if (!studyOn) return

		if (state === undefined) {
			if (skeleton instanceof HTMLElement) skeleton.hidden = false
		} else if (state === true) {
			title?.classList.add('is-success')
			if (mark instanceof HTMLElement) mark.hidden = false
		} else {
			title?.classList.add('is-failure')
		}
	}

	function applyFilters() {
		const items = studyItems()
		items.forEach((item) => {
			const index = Number(item.dataset.index)
			let visible = true
			if (currentErrorsOnly && masonryItemState[index] === true) visible = false
			if (historicalOnly && !(historicalMasonryItem[index] < 0)) visible = false
			item.style.display = visible ? '' : 'none'
			applyItemUi(item)
		})
		requestAnimationFrame(() => {
			measureAll(root)
			revealGrids(root)
		})
	}

	function enterStudyView() {
		if (!(studyGrid instanceof HTMLElement) || !(defaultView instanceof HTMLElement)) return
		if (!(studyView instanceof HTMLElement)) return

		trackedStudyItems = collectStudyItemsFromBlocks()
		// Recover if a previous exit left items in the study grid.
		if (trackedStudyItems.length === 0) {
			trackedStudyItems = collectStudyItemsFromGrid()
		}

		trackedStudyItems.forEach((item) => {
			if (
				!originalParent.has(item) &&
				item.parentElement &&
				item.parentElement !== studyGrid
			) {
				originalParent.set(item, item.parentElement)
			}
			studyGrid.appendChild(item)
		})
		defaultView.hidden = true
		studyView.hidden = false
		applyFilters()
	}

	function exitStudyView() {
		// Append in tracked order so siblings return in the original sequence.
		trackedStudyItems.forEach((item) => {
			const parent = originalParent.get(item)
			if (parent) parent.appendChild(item)
			item.style.display = ''
			applyItemUi(item)
		})
		trackedStudyItems = []
		if (defaultView instanceof HTMLElement) defaultView.hidden = false
		if (studyView instanceof HTMLElement) studyView.hidden = true
		requestAnimationFrame(() => {
			measureAll(root)
			revealGrids(root)
		})
	}

	function resetSession() {
		masonryItemState = {}
		successCount = 0
		failedCount = 0
		currentErrorsOnly = false
		const currentErrorsInput = root.querySelector('[data-action="toggle-current-errors"]')
		if (currentErrorsInput instanceof HTMLInputElement) currentErrorsInput.checked = false
		updateScore()
		applyFilters()
	}

	function markSuccess(index) {
		if (masonryItemState[index] === false) failedCount = Math.max(0, failedCount - 1)
		if (masonryItemState[index] !== true) successCount += 1
		masonryItemState[index] = true
		updateScore()
		applyFilters()
	}

	function markFailure(index) {
		if (masonryItemState[index] === true) successCount = Math.max(0, successCount - 1)
		if (masonryItemState[index] !== false) failedCount += 1
		masonryItemState[index] = false

		const next = {
			...historicalMasonryItem,
			[index]: historicalMasonryItem[index] || 0 - 1,
		}
		historicalMasonryItem = next
		localStorage.setItem(storageKey, JSON.stringify(next))
		updateScore()
		applyFilters()
	}

	function toggleStudy(on) {
		studyOn = on
		setTocFabVisible(!on)
		resetSession()
		setAdvancedVisible(on)
		if (on) enterStudyView()
		else {
			historicalOnly = false
			const historicalInput = root.querySelector('[data-action="toggle-historical"]')
			if (historicalInput instanceof HTMLInputElement) historicalInput.checked = false
			exitStudyView()
			setAdvancedVisible(false)
		}
	}

	root.addEventListener('click', (event) => {
		const target = event.target
		if (!(target instanceof Element)) return
		const actionEl = target.closest('[data-action]')
		if (!(actionEl instanceof HTMLElement)) return
		const item = actionEl.closest('.masonry-item')
		const index = item instanceof HTMLElement ? Number(item.dataset.index) : NaN
		const action = actionEl.dataset.action

		if (action === 'clear-storage') {
			localStorage.removeItem(storageKey)
			historicalMasonryItem = {}
			applyFilters()
			return
		}
		if (action === 'reset-study') {
			resetSession()
			return
		}
		if (!Number.isFinite(index)) return
		if (action === 'mark-success') markSuccess(index)
		if (action === 'mark-failed' || action === 'remark-failed') {
			if (action === 'remark-failed' && masonryItemState[index] !== true) return
			markFailure(index)
		}
	})

	root.addEventListener('change', (event) => {
		const target = event.target
		if (!(target instanceof HTMLInputElement)) return
		const action = target.dataset.action
		if (action === 'toggle-study') toggleStudy(target.checked)
		if (action === 'toggle-historical') {
			historicalOnly = target.checked
			applyFilters()
		}
		if (action === 'toggle-current-errors') {
			currentErrorsOnly = target.checked
			applyFilters()
		}
	})

	if (!studyAvailable && toolbar) toolbar.hidden = true
	updateScore()

	// First paint is handled by masonry-boot-inline.js (sync, before paint).
	// Module only attaches img listeners and provides a reveal fallback.
	measureAll(root)
	if (root.dataset.masonryBoot === 'done') revealGrids(root)

	if (document.fonts?.ready) {
		document.fonts.ready
			.then(() => {
				measureAll(root)
				if (root.dataset.masonryBoot === 'done') revealGrids(root)
			})
			.catch(() => {})
	}

	window.setTimeout(() => {
		measureAll(root)
		revealGrids(root)
		root.dataset.masonryBoot = 'done'
	}, 900)
}
