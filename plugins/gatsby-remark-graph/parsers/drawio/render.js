import puppeteer from 'puppeteer';

const generateHtml = (basePath) => {
  const html = `<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->
  <!DOCTYPE html>
  <html>
  <head>
  <title>Drawio</title>
  <meta charset="utf-8"/>
  </head>
  <body>
  <div id="app"></div>
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
        viewer.graph.destroy()
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
        return svg.outerHTML;
      }
      async function selectPage(index) {
          viewer.selectPage(index);
          return new Promise((resolve) => {
              let interval = setInterval(() => {
                  if(viewer.currentPage === index) {
                      clearInterval(interval);
                      resolve();
                  }
              })
          })
      }
  </script>
  </body>
  </html>`;
  return html;
};

class DrawioRender {
  browser = null;
  pages = [];
  pagesState = [];
  basePath = null;
  pageCount = 3;
  initializing = false;

  async init(basePath) {
    this.basePath = basePath;
    if (this.initializing) {
      return new Promise((resolve) => {
        let interval = setInterval(() => {
          if (!this.initializing) {
            clearInterval(interval);
            resolve();
          }
        }, 20);
      });
    }
    this.initializing = true;
    this.browser = await puppeteer.launch({headless: true});
    this.pages = [];
    for (let i = 0; i < this.pageCount; i++) {
      this.pages[i] = await this.browser.newPage();
      await this.pages[i].setContent(generateHtml(this.basePath));
    }
    this.initializing = false;
  }

  async offer() {
    const me = this;
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        for (let i = 0; i < me.pages.length; i++) {
          if (me.pagesState[i] !== 'busy') {
            me.pagesState[i] = 'busy';
            resolve({
              page: me.pages[i],
              index: i,
            });
            clearInterval(interval);
          }
        }
      }, 20);
    });
  }

  async cycle(page) {
    this.pagesState[page.index] = 'free';
  }

  async renderSvgs(content, page) {
    const browserPage = await this.offer();
    await browserPage.page.evaluate(
      async ({ content }) => {
        render(content);
      },
      { content }
    );

    await browserPage.page.waitForSelector('svg', {
      timeout: 60 * 1000 * 10,
    });

    const svg = await browserPage.page.evaluate(
      async ({ page }) => {
        let svg = isNaN(page) ? await getSvgs() : await getSvg(page);

        return svg;
      },
      { content, page }
    );

    await browserPage.page.evaluate(
      async ({ content }) => {
        destroy();
      },
      { content }
    );
    await this.cycle(browserPage);
    return svg;
  }
  async close() {
    await this.browser.close();
  }
}

export default DrawioRender;
