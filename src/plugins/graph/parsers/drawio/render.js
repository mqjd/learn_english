import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { JSDOM, VirtualConsole } from 'jsdom'

const generateHtml = (basePath) => `<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->
<!DOCTYPE html>
<html>
<head>
<title>Drawio</title>
<meta charset="utf-8"/>
</head>
<body>
<div id="app" style="width:800px;height:600px"></div>
<script>
  window.mxBasePath = "${basePath}";
  window.PROXY_URL = window.mxBasePath;
  window.STYLE_PATH = window.mxBasePath + "/styles";
  window.SHAPES_PATH = window.mxBasePath + "/shapes";
  window.STENCIL_PATH = window.mxBasePath + "/stencils";
  window.GRAPH_IMAGE_PATH = window.mxBasePath + "/img";
  window.mxImageBasePath = window.mxBasePath + "/images";
  window.mxLoadStylesheets = window.mxLoadStylesheets || !1;
  window.DRAWIO_BASE_URL = window.mxBasePath;
</script>
<script type="text/javascript" src="${basePath}/viewer.min.js"></script>
<script>
    window.startWith = (str, start) => str.indexOf(start) === 0
    function destroy(){
      if (window.viewer?.graph) {
        viewer.graph.destroy()
      }
    }
    function render(content){
      const url = content;
      if(startWith(url, "http")){
          GraphViewer.getUrl(url, createViewer);
      } else {
          createViewer(url);
      }
    }

    function createViewer (content) {
        window.viewer = new GraphViewer(
            document.querySelector("#app"),
            mxUtils.parseXml(content).documentElement,
            {
                "dark-mode": false,
                highlight: "#00afff",
                lightbox: null,
                nav: true,
                resize: true,
                toolbar: "pages zoom layers lightbox",
            }
        );
    }
    async function getSvgs() {
      const result = [];
      for (let i = 0; i < viewer.diagrams.length; i++) {
        const svg = await getSvg(i)
        result.push(svg)
      }
      return result
    }
    async function getSvg(page) {
      const viewer = window.viewer;
      await selectPage(page);
      const svg = viewer.graph.getSvg(null, 1, "0");
      svg.setAttribute("key", page)
      svg.style.maxHeight = "100%";
      svg.style.maxWidth = "100%";
      return mxUtils.getXml(svg);
    }
    async function selectPage(index) {
        viewer.handlingResize = false;
        viewer.selectPage(index);
        return new Promise((resolve, reject) => {
            let n = 0;
            let interval = setInterval(() => {
                if(viewer.currentPage === index) {
                    clearInterval(interval);
                    resolve();
                } else if (++n > 500) {
                    clearInterval(interval);
                    reject(new Error("selectPage timeout: " + index));
                }
            }, 10)
        })
    }
</script>
</body>
</html>`

function isViewportElement(el, window) {
	return (
		el === window.document.documentElement ||
		el === window.document.body ||
		el?.id === 'app'
	)
}

function stubLayout(window) {
	// Only size the viewport/#app. Stubbing every element to 800x600
	// inflates graph bounds and leaves huge empty margins in exported SVGs.
	window.Element.prototype.getBoundingClientRect = function () {
		if (isViewportElement(this, window)) {
			return {
				x: 0,
				y: 0,
				top: 0,
				left: 0,
				bottom: 600,
				right: 800,
				width: 800,
				height: 600,
				toJSON() {
					return this
				},
			}
		}
		const width = Number.parseFloat(this.style?.width) || 0
		const height = Number.parseFloat(this.style?.height) || 0
		return {
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			bottom: height,
			right: width,
			width,
			height,
			toJSON() {
				return this
			},
		}
	}

	for (const prop of ['offsetWidth', 'clientWidth']) {
		Object.defineProperty(window.HTMLElement.prototype, prop, {
			configurable: true,
			get() {
				if (isViewportElement(this, window)) return 800
				return Number.parseFloat(this.style?.width) || 0
			},
		})
	}
	for (const prop of ['offsetHeight', 'clientHeight']) {
		Object.defineProperty(window.HTMLElement.prototype, prop, {
			configurable: true,
			get() {
				if (isViewportElement(this, window)) return 600
				return Number.parseFloat(this.style?.height) || 0
			},
		})
	}
}

async function waitForViewer(win, timeoutMs = 30_000) {
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		if (win.viewer?.graph && (win.viewer.diagrams?.length ?? 0) > 0) {
			return
		}
		await new Promise((r) => setTimeout(r, 50))
	}
	throw new Error('Timed out waiting for GraphViewer to finish rendering')
}

class DrawioRender {
	htmlPath = null
	mxgraphBaseUrl = null

	async init(mxgraphPath) {
		const baseUrl = pathToFileURL(
			mxgraphPath.endsWith(path.sep) ? mxgraphPath : mxgraphPath + path.sep,
		).href.replace(/\/$/, '')
		this.mxgraphBaseUrl = baseUrl

		const html = generateHtml(baseUrl)
		const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drawio-render-'))
		this.htmlPath = path.join(tmpDir, 'drawio.html')
		fs.writeFileSync(this.htmlPath, html, 'utf8')
	}

	async renderSvgs(content, page) {
		if (!this.htmlPath) {
			throw new Error('DrawioRender not initialized')
		}

		const url = pathToFileURL(this.htmlPath).href
		const virtualConsole = new VirtualConsole()
		virtualConsole.on('jsdomError', () => {})

		const dom = await JSDOM.fromFile(this.htmlPath, {
			url,
			runScripts: 'dangerously',
			resources: 'usable',
			pretendToBeVisual: true,
			virtualConsole,
			beforeParse: stubLayout,
		})

		const win = dom.window

		try {
			await new Promise((resolve) => {
				if (win.document.readyState === 'complete') resolve()
				else win.addEventListener('load', () => resolve(), { once: true })
			})

			// Wait for viewer.min.js to define GraphViewer
			const scriptStart = Date.now()
			while (Date.now() - scriptStart < 30_000) {
				if (typeof win.GraphViewer === 'function' && typeof win.mxUtils !== 'undefined') {
					break
				}
				await new Promise((r) => setTimeout(r, 50))
			}
			if (typeof win.GraphViewer !== 'function') {
				throw new Error('Timed out waiting for mxgraph viewer.min.js to load')
			}

			win.render(content)
			await waitForViewer(win)

			const svg =
				page === undefined || page === null || Number.isNaN(Number(page))
					? await win.getSvgs()
					: await win.getSvg(Number(page))

			win.destroy()
			return svg
		} finally {
			win.close()
		}
	}

	async close() {
		if (this.htmlPath) {
			try {
				fs.rmSync(path.dirname(this.htmlPath), { recursive: true, force: true })
			} catch {
				// ignore cleanup errors
			}
			this.htmlPath = null
		}
	}
}

export default DrawioRender
