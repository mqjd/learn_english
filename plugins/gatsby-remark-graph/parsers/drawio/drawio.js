import { readFileIfExists } from '../../utils/index.js';
import DrawioRender from './render.js';

const ENV = process.env.ENV;

const isProduct = ENV === 'PROD';
const render = new DrawioRender();

process.once('SIGINT', async () => {
  await render.close();
});

const cache = {};
const drawioParser = async (param) => {
  const {
    content,
    pluginOptions: { basePath, remoteBasePath, mxgraphProxy },
    nodeOptions,
  } = param;

  await render.init(mxgraphProxy);
  console.log(`render ${content} page: ${nodeOptions.page || 'all'} start`);
  const key = content + nodeOptions.page;
  if (isProduct && cache[key]) {
    return cache[key];
  }
  const localPath = basePath + content;
  let drawioContent = await readFileIfExists(localPath);
  if (drawioContent === null) {
    if (content.indexOf('http') !== 0) {
      drawioContent = content;
    } else {
      drawioContent = remoteBasePath + content;
    }
  }
  const svg = await render.renderSvgs(drawioContent, nodeOptions.page);
  cache[key] = svg;
  console.log(`render ${content} page: ${nodeOptions.page || 'all'} end`);
  return svg;
};

export default drawioParser;
