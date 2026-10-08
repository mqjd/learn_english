const MODES = new Set(['normal', 'presenter', 'overview', 'grid'])
let globalListenersMounted = false
let timerStartedAt = 0
let timerElapsed = 0
let timerInterval
const deckOrigins = new WeakMap()

const getDeck = () => document.querySelector('[data-deck]')

// Scope to the viewport so presenter clones (also marked data-deck-slide) are excluded.
const querySlides = (root) => {
	const viewport = root.querySelector('[data-deck-viewport]')
	return [...(viewport ?? root).querySelectorAll('[data-deck-slide]')]
}

const SLIDE_RATIO = 16 / 9

const updatePageOverflow = () => {
	const root = getDeck()
	if (!root) {
		document.documentElement.classList.remove('deck-page-fits')
		return
	}
	const maximized = root.dataset.maximized === 'true' || root.matches(':fullscreen')
	const pageTop = root.getBoundingClientRect().top + window.scrollY
	let availableWidth
	let availableHeight
	if (maximized) {
		// Letterbox to a fixed 16:9 stage so slide ratio never tracks the window.
		availableWidth = Math.min(window.innerWidth, window.innerHeight * SLIDE_RATIO)
		availableHeight = availableWidth / SLIDE_RATIO
	} else {
		availableHeight = Math.max(
			160,
			Math.min(window.innerHeight * 0.8, window.innerHeight - pageTop - 12),
		)
		const containerWidth = root.parentElement?.clientWidth || root.clientWidth
		availableWidth = Math.min(containerWidth, availableHeight * SLIDE_RATIO)
	}
	root.style.setProperty('--deck-available-height', `${availableHeight}px`)
	root.style.setProperty('--deck-available-width', `${availableWidth}px`)
	const bounds = root.getBoundingClientRect()
	const fits = maximized || (
		root.dataset.mode === 'normal' &&
		!root.matches(':fullscreen') &&
		window.scrollY === 0 &&
		bounds.top >= 0 &&
		bounds.bottom <= window.innerHeight
	)
	document.documentElement.classList.toggle('deck-page-fits', Boolean(fits))
}

const parseHash = () => {
	const parameters = new URLSearchParams(location.hash.slice(1))
	return {
		index: Number.parseInt(parameters.get('slide') ?? '0', 10) || 0,
		step: Number.parseInt(parameters.get('step') ?? '0', 10) || 0,
	}
}

const writeLocation = (root, { push = false, mode } = {}) => {
	const url = new URL(location.href)
	const parameters = new URLSearchParams(url.hash.slice(1))
	parameters.set('slide', root.dataset.index ?? '0')
	parameters.set('step', root.dataset.step ?? '0')
	url.hash = parameters.toString()
	if (mode) url.searchParams.set('mode', mode)
	else url.searchParams.delete('mode')
	if (root.dataset.maximized === 'true') url.searchParams.set('maximize', 'true')
	else url.searchParams.delete('maximize')
	history[push ? 'pushState' : 'replaceState']({}, '', url)
}

const getStepTargets = (slide) => {
	const targets = []
	for (const group of slide.querySelectorAll('[data-deck-steps]')) {
		const list = group.querySelector('ul, ol')
		if (list) targets.push(...list.children)
	}
	for (const group of slide.querySelectorAll('[data-deck-appear]')) {
		targets.push(...group.children)
	}
	targets.forEach((target, index) => {
		target.dataset.deckStep = String(index)
	})
	return targets
}

const clearSlideFit = (slide) => {
	const content = slide.querySelector('.deck-slide-content')
	if (!content) return
	content.style.removeProperty('width')
	content.style.removeProperty('height')
	content.style.removeProperty('flex')
	content.style.removeProperty('transform')
	content.style.removeProperty('transform-origin')
	content.style.removeProperty('justify-content')
}

const fitSlideContent = (slide) => {
	const content = slide.querySelector('.deck-slide-content')
	if (!content) return
	clearSlideFit(slide)
	const availableWidth = content.clientWidth
	const availableHeight = content.clientHeight
	if (!availableWidth || !availableHeight) return
	content.style.justifyContent = 'flex-start'
	const hasIntentionalBleed = content.querySelector('.home-page')
	const naturalWidth = hasIntentionalBleed
		? availableWidth
		: Math.max(availableWidth, content.scrollWidth)
	const naturalHeight = Math.max(availableHeight, content.scrollHeight)
	const scale = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight)
	if (scale < 1) {
		content.style.transform = `scale(${scale})`
		content.style.transformOrigin = 'center top'
	} else {
		content.style.removeProperty('justify-content')
	}
}

const fitDeckContent = (root, slides, index) => {
	const mode = root.dataset.mode
	if (mode === 'normal') {
		slides.forEach((slide, slideIndex) => {
			if (slideIndex === index) fitSlideContent(slide)
			else clearSlideFit(slide)
		})
		return
	}
	// Grid/overview: Zoom lives on `.deck-slide-scale`; fit content inside it so
	// overflowing diagrams/images shrink instead of being clipped.
	if (mode === 'grid' || mode === 'overview') {
		slides.forEach(fitSlideContent)
		return
	}
	slides.forEach(clearSlideFit)
}

const getStepCount = (slide) => {
	const targets = getStepTargets(slide)
	const carouselSteps = [...slide.querySelectorAll('[data-graph-carousel]')].reduce(
		(max, carousel) =>
			Math.max(max, carousel.querySelector('[data-graph-carousel-slides]')?.children.length - 1 || 0),
		0,
	)
	return Math.max(targets.length, carouselSteps)
}

const cloneContent = (root, slide, target) => {
	if (!target) return
	const clone = slide.cloneNode(true)
	clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'))
	clone
		.querySelectorAll('[data-deck-notes], [data-deck-head], .sl-anchor-link')
		.forEach((node) => node.remove())
	clone.querySelector('.deck-slide-content')?.removeAttribute('style')
	clone.removeAttribute('data-deck-slide')
	clone.setAttribute('data-active', '')
	const sourceWidth =
		Number.parseFloat(getComputedStyle(root).getPropertyValue('--deck-available-width')) ||
		root.clientWidth
	const sourceHeight = sourceWidth / SLIDE_RATIO
	const targetRect = target.getBoundingClientRect()
	const scale = Math.min(targetRect.width / sourceWidth, targetRect.height / sourceHeight)
	const canvas = document.createElement('div')
	canvas.className = 'deck-presenter-canvas'
	clone.style.position = 'absolute'
	clone.style.top = '0'
	clone.style.left = '0'
	clone.style.width = `${sourceWidth}px`
	clone.style.height = `${sourceHeight}px`
	clone.style.maxWidth = 'none'
	clone.style.transform = `scale(${scale})`
	clone.style.transformOrigin = 'top left'
	canvas.replaceChildren(clone)
	target.replaceChildren(canvas)
}

const updatePresenter = (root, slides, index) => {
	const presenter = root.querySelector('[data-deck-presenter]')
	if (!presenter) return
	presenter.hidden = root.dataset.mode !== 'presenter'
	if (presenter.hidden) return
	cloneContent(root, slides[index], presenter.querySelector('[data-presenter-current]'))
	cloneContent(root, slides[Math.min(index + 1, slides.length - 1)], presenter.querySelector('[data-presenter-next]'))
	const notes = slides[index].querySelector('[data-deck-notes]')
	const notesTarget = presenter.querySelector('[data-presenter-notes]')
	if (notesTarget) notesTarget.replaceChildren(...(notes ? [...notes.cloneNode(true).childNodes] : []))
	const counter = presenter.querySelector('[data-presenter-counter]')
	if (counter) counter.textContent = `${index + 1} / ${slides.length}`
}

const applyDeckState = (root, { write = false, push = false } = {}) => {
	const slides = querySlides(root)
	if (slides.length === 0) return
	const index = Math.max(0, Math.min(Number(root.dataset.index) || 0, slides.length - 1))
	const step = Math.max(0, Math.min(Number(root.dataset.step) || 0, getStepCount(slides[index])))
	root.dataset.index = String(index)
	root.dataset.step = String(step)
	slides.forEach((slide, slideIndex) => {
		const active = slideIndex === index
		slide.toggleAttribute('data-active', active)
		const visible = active || ['overview', 'grid', 'print'].includes(root.dataset.mode)
		slide.setAttribute('aria-hidden', String(!visible))
		if (active) {
			getStepTargets(slide).forEach((target) => {
				target.toggleAttribute('data-step-visible', Number(target.dataset.deckStep) < step)
			})
		}
	})
	fitDeckContent(root, slides, index)
	const counter = root.querySelector('[data-deck-counter]')
	if (counter) counter.textContent = `${index + 1} / ${slides.length}`
	const status = root.querySelector('[data-deck-status]')
	if (status) status.textContent = `Slide ${index + 1} of ${slides.length}, step ${step}`
	root.dispatchEvent(new CustomEvent('deck:step', { bubbles: true, detail: { index, step } }))
	if (write) writeLocation(root, { push, mode: root.dataset.mode === 'normal' ? undefined : root.dataset.mode })
	updatePageOverflow()
	updatePresenter(root, slides, index)
}

const setMode = (root, mode) => {
	root.dataset.mode = MODES.has(mode) ? mode : 'normal'
	applyDeckState(root)
	writeLocation(root, { mode: root.dataset.mode === 'normal' ? undefined : root.dataset.mode })
}

const changeSlide = (root, delta) => {
	const slides = querySlides(root)
	const index = Number(root.dataset.index) || 0
	const step = Number(root.dataset.step) || 0
	if (delta > 0 && step < getStepCount(slides[index])) {
		root.dataset.step = String(step + 1)
		return applyDeckState(root, { write: true })
	}
	if (delta < 0 && step > 0) {
		root.dataset.step = String(step - 1)
		return applyDeckState(root, { write: true })
	}
	const nextIndex = Math.max(0, Math.min(index + delta, slides.length - 1))
	if (nextIndex === index) return
	root.dataset.index = String(nextIndex)
	root.dataset.step = delta > 0 ? '0' : String(getStepCount(slides[nextIndex]))
	applyDeckState(root, { write: true, push: true })
}

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const setMaximized = (root, maximized) => {
	const isMaximized = root.dataset.maximized === 'true'
	if (maximized && !isMaximized) {
		deckOrigins.set(root, { parent: root.parentNode, nextSibling: root.nextSibling })
		document.body.append(root)
		root.dataset.maximized = 'true'
	} else if (!maximized && isMaximized) {
		delete root.dataset.maximized
		const origin = deckOrigins.get(root)
		if (origin?.parent?.isConnected) {
			const nextSibling = origin.nextSibling?.parentNode === origin.parent ? origin.nextSibling : null
			origin.parent.insertBefore(root, nextSibling)
		}
		deckOrigins.delete(root)
	}
	document.documentElement.classList.toggle('deck-maximized', root.dataset.maximized === 'true')
	updatePageOverflow()
	fitDeckContent(root, querySlides(root), Number(root.dataset.index) || 0)
	writeLocation(root, { mode: root.dataset.mode === 'normal' ? undefined : root.dataset.mode })
}

const togglePageFullscreen = (root) => {
	setMaximized(root, root.dataset.maximized !== 'true')
}

const updateTimer = () => {
	const total = timerElapsed + (timerStartedAt ? Math.floor((Date.now() - timerStartedAt) / 1000) : 0)
	document.querySelectorAll('[data-deck-timer]').forEach((node) => {
		node.textContent = formatTime(total)
	})
}

const handleAction = (root, action, button) => {
	switch (action) {
		case 'previous':
			changeSlide(root, -1)
			break
		case 'next':
			changeSlide(root, 1)
			break
		case 'mode':
			setMode(root, root.dataset.mode === button.dataset.mode ? 'normal' : button.dataset.mode)
			break
		case 'print':
			root.dataset.mode = 'print'
			window.print()
			break
		case 'fullscreen':
			if (document.fullscreenElement) document.exitFullscreen()
			else togglePageFullscreen(root)
			button.blur()
			break
		case 'code-fullscreen': {
			const code = button.closest('[data-deck-code]')
			if (code && document.fullscreenElement !== code) code.requestFullscreen?.()
			else if (document.fullscreenElement === code) document.exitFullscreen()
			break
		}
		case 'timer-toggle':
			if (timerStartedAt) {
				timerElapsed += Math.floor((Date.now() - timerStartedAt) / 1000)
				timerStartedAt = 0
				clearInterval(timerInterval)
				document.querySelectorAll('[data-deck-action="timer-toggle"]').forEach((toggle) => {
					toggle.textContent = 'Start timer'
				})
			} else {
				timerStartedAt = Date.now()
				timerInterval = window.setInterval(updateTimer, 1000)
				document.querySelectorAll('[data-deck-action="timer-toggle"]').forEach((toggle) => {
					toggle.textContent = 'Stop timer'
				})
			}
			updateTimer()
			break
		case 'timer-reset':
			timerElapsed = 0
			if (timerStartedAt) timerStartedAt = Date.now()
			updateTimer()
			break
	}
}

const mountRoot = (root) => {
	if (root.dataset.deckReady) return
	if (window.scrollY > 0) window.scrollTo(0, 0)
	root.dataset.deckReady = 'true'
	const slides = querySlides(root)
	const hash = parseHash()
	const query = new URLSearchParams(location.search)
	const queryMode = query.get('mode')
	root.dataset.index = String(Math.max(0, Math.min(hash.index, slides.length - 1)))
	root.dataset.step = String(hash.step)
	root.dataset.mode = MODES.has(queryMode) ? queryMode : 'normal'
	if (root.getAttribute('aria-label')) document.title = root.getAttribute('aria-label')
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target.closest('[data-deck-action]') : null
		if (target) handleAction(root, target.dataset.deckAction, target)
		const slide = event.target instanceof Element ? event.target.closest('[data-deck-slide]') : null
		if (
			slide &&
			slides.includes(slide) &&
			(root.dataset.mode === 'overview' ||
				(root.dataset.mode === 'grid' &&
					(root.matches(':fullscreen') || root.dataset.maximized === 'true')))
		) {
			root.dataset.index = String(slides.indexOf(slide))
			root.dataset.step = '0'
			setMode(root, 'normal')
		}
	})
	let touchStartX = 0
	root.addEventListener('touchstart', (event) => {
		touchStartX = event.changedTouches[0]?.clientX ?? 0
	}, { passive: true })
	root.addEventListener('touchend', (event) => {
		if (root.dataset.mode !== 'normal') return
		const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
		if (Math.abs(delta) > 48) changeSlide(root, delta < 0 ? 1 : -1)
	}, { passive: true })
	root.addEventListener('deck:step', (event) => {
		const { step } = event.detail
		root.querySelectorAll('[data-graph-carousel]').forEach((carousel) => {
			carousel.dispatchEvent(new CustomEvent('deck:step', { bubbles: false, detail: { step } }))
		})
	})
	applyDeckState(root)
	if (query.has('maximize')) setMaximized(root, true)
}

const onKeyDown = (event) => {
	const root = getDeck()
	if (!root || event.metaKey || event.ctrlKey) return
	if (event.key === 'Escape' && (document.fullscreenElement || root.dataset.maximized === 'true')) {
		event.preventDefault()
		if (document.fullscreenElement) document.exitFullscreen()
		if (root.dataset.maximized === 'true') togglePageFullscreen(root)
		setMode(root, 'normal')
		return
	}
	const target = event.target
	if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(target.tagName))) return
	if (event.altKey) {
		const modes = { p: 'presenter', o: 'overview', g: 'grid' }
		const key = { KeyP: 'p', KeyO: 'o', KeyG: 'g' }[event.code] ?? event.key.toLowerCase()
		if (modes[key]) {
			event.preventDefault()
			setMode(root, root.dataset.mode === modes[key] ? 'normal' : modes[key])
		}
		return
	}
	if (event.shiftKey && event.key.toLowerCase() === 'p') {
		event.preventDefault()
		root.dataset.mode = 'print'
		window.print()
		return
	}
	if (event.shiftKey && event.key === ' ') {
		event.preventDefault()
		changeSlide(root, -1)
		return
	}
	switch (event.key) {
		case 'ArrowRight':
		case 'ArrowDown':
		case 'PageDown':
		case ' ':
			event.preventDefault()
			changeSlide(root, 1)
			break
		case 'ArrowLeft':
		case 'ArrowUp':
		case 'PageUp':
			 event.preventDefault()
			changeSlide(root, -1)
			break
		case 'Escape':
			if (document.fullscreenElement) document.exitFullscreen()
			setMode(root, 'normal')
			break
		case 'f':
		case 'F11':
			if (document.fullscreenElement) document.exitFullscreen()
			else togglePageFullscreen(root)
			break
	}
}

export function mountDecks() {
	document.querySelectorAll('[data-deck]').forEach(mountRoot)
	window.requestAnimationFrame?.(updatePageOverflow) ?? updatePageOverflow()
	document.querySelectorAll('[data-deck-clock]').forEach((node) => {
		if (node.dataset.clockReady) return
		node.dataset.clockReady = 'true'
		const updateClock = () => { node.textContent = new Date().toLocaleTimeString() }
		updateClock()
		window.setInterval(updateClock, 1000)
	})
	if (globalListenersMounted) return
	globalListenersMounted = true
	window.addEventListener('resize', () => {
		updatePageOverflow()
		const root = getDeck()
		if (!root) return
		const slides = querySlides(root)
		fitDeckContent(root, slides, Number(root.dataset.index) || 0)
		if (root.dataset.mode === 'presenter') {
			updatePresenter(root, slides, Number(root.dataset.index) || 0)
		}
	})
	document.querySelectorAll('[data-deck] img').forEach((image) => {
		image.addEventListener('load', () => {
			const root = getDeck()
			if (!root) return
			fitDeckContent(root, querySlides(root), Number(root.dataset.index) || 0)
		})
	})
	window.addEventListener('scroll', updatePageOverflow)
	window.addEventListener('keydown', onKeyDown)
	document.addEventListener('astro:before-swap', () => {
		document.documentElement.classList.remove('deck-page-fits', 'deck-maximized')
	})
	window.addEventListener('hashchange', () => {
		const root = getDeck()
		if (!root) return
		Object.assign(root.dataset, { index: String(parseHash().index), step: String(parseHash().step) })
		applyDeckState(root)
	})
	window.addEventListener('popstate', () => {
		const root = getDeck()
		if (!root) return
		const query = new URLSearchParams(location.search)
		const mode = query.get('mode')
		root.dataset.mode = MODES.has(mode) ? mode : 'normal'
		Object.assign(root.dataset, { index: String(parseHash().index), step: String(parseHash().step) })
		setMaximized(root, query.has('maximize'))
		applyDeckState(root)
	})
}