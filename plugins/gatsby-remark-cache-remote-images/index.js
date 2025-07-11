import { visit } from 'unist-util-visit';
import { createRemoteFileNode } from 'gatsby-source-filesystem';

export default async function remarkMdxImageStyle(
  { markdownAST },
  options = {}
) {
  const { saveImageTo } = options;
  const basePathLength = saveImageTo.endsWith('/')
    ? saveImageTo.length
    : saveImageTo.length + 1;
  const createMockCache = () => {
    const store = new Map();
    return {
      directory: saveImageTo + 'remote-images-cache/',
      get: async (key) => store.get(key),
      set: async (key, value) => store.set(key, value),
      remove: async (key) => store.delete(key),
      getAllKeys: async () => Array.from(store.keys()),
    };
  };

  const createNode = (node, name) => {
    return {};
  };
  const createNodeId = (url) => {
    return '1';
  };
  const removeImages = [];
  visit(markdownAST, 'image', (node) => {
    if (node.url.indexOf('http') != -1) {
      removeImages.push(node);
    }
  });

  const generateGraphAndUpdateNode = async (node) => {
    try {
      const fileNode = await createRemoteFileNode({
        createNodeId,
        createNode,
        cache: createMockCache(),
        url: node.url,
        parentNodeId: 1,
      });
      node.url = fileNode.absolutePath.substring(basePathLength);
    } catch (e) {
      console.error(`plugin: graph, error when parse ${node.value}`, e);
    }
  };
  await Promise.all(removeImages.map(generateGraphAndUpdateNode));
}
