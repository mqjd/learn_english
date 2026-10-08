import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

test('keyboard navigation reveals steps, syncs graph pages, and updates the hash', async () => {
	const dom = new JSDOM(
		'<article><main data-deck aria-label="Deck"><div data-deck-viewport><section data-deck-slide><div data-deck-steps><ol><li>One</li><li>Two</li></ol></div><div data-graph-carousel><div data-graph-carousel-slides><div>A</div><div>B</div></div></div></section><section data-deck-slide>Second</section></div><output data-deck-counter></output><span data-deck-status></span></main></article>',
		{ url: 'https://example.test/posts/demo/#slide=0&step=0' },
	)
	const globals = {
		window: dom.window,
		document: dom.window.document,
		Element: dom.window.Element,
		HTMLElement: dom.window.HTMLElement,
		CustomEvent: dom.window.CustomEvent,
		location: dom.window.location,
		history: dom.window.history,
	}
	for (const [name, value] of Object.entries(globals)) globalThis[name] = value

	try {
		let graphStep = 0
		document.querySelector('[data-graph-carousel]').addEventListener('deck:step', (event) => {
			graphStep = event.detail.step
		})
		const { mountDecks } = await import('./client.js?client-test')
		mountDecks()
		assert.equal(document.querySelector('[data-deck]').parentElement.tagName, 'ARTICLE')
		assert.equal(document.documentElement.classList.contains('deck-page-fits'), true)
		const deck = document.querySelector('[data-deck]')
		const fullscreenButton = document.createElement('button')
		fullscreenButton.dataset.deckAction = 'fullscreen'
		deck.append(fullscreenButton)
		fullscreenButton.focus()
		fullscreenButton.click()
		assert.equal(deck.dataset.maximized, 'true')
		assert.equal(deck.parentElement, document.body)
		assert.equal(document.activeElement, document.body)
		window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
		assert.equal(deck.dataset.maximized, undefined)
		assert.equal(deck.parentElement.tagName, 'ARTICLE')
		const pressRight = () =>
			window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }))

		pressRight()
		assert.equal(document.querySelectorAll('[data-step-visible]').length, 1)
		assert.equal(graphStep, 1)
		assert.match(location.hash, /step=1/)

		pressRight()
		assert.equal(document.querySelectorAll('[data-step-visible]').length, 2)
		pressRight()
		assert.equal(document.querySelector('[data-deck]').dataset.index, '1')
		assert.match(location.hash, /slide=1/)

		window.dispatchEvent(
			new window.KeyboardEvent('keydown', {
				key: '˙',
				code: 'KeyG',
				altKey: true,
				cancelable: true,
			}),
		)
		assert.equal(document.querySelector('[data-deck]').dataset.mode, 'grid')
		assert.equal(
			[...document.querySelectorAll('[data-deck-slide]')].every(
				(slide) => slide.getAttribute('aria-hidden') === 'false',
			),
			true,
		)
	} finally {
		dom.window.close()
		for (const name of Object.keys(globals)) delete globalThis[name]
	}
})