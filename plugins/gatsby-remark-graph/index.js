import { visit } from "unist-util-visit";
import { resolveParams, startWith } from "./utils/index.js";
import parser from "./parsers/index.js";

const prefix = "graph";
const prefixLength = prefix.length + 1;

const graphViewer = async (gatsbyNodeHelpers, pluginOptions = {}) => {
  const { markdownAST, reporter } = gatsbyNodeHelpers;
  const graphNodes = [];
  visit(markdownAST, `code`, (node) => {
    const lang = (node.lang || "").trim();
    if (startWith(lang, prefix)) {
      graphNodes.push({
        node,
        options: resolveParams(lang.substr(prefixLength)),
      });
    }
    return node;
  });

  if (graphNodes.length === 0) {
    return;
  }

  const generateGraphAndUpdateNode = async ({ node, options }) => {
    try {
      const resultNode = await parser({
        content: node.value,
        nodeOptions: options,
        reporter,
        pluginOptions,
      });
      node.type = resultNode.type;
      node.name = resultNode.name;
      node.children = resultNode.children;
      node.attributes = resultNode.attributes;
    } catch (e) {
      reporter.error(`plugin: graph, error when parse ${node.value}`, e);
      node.type = `html`;
      node.value = `<span>${e}</span>`;
    }
  };
  await Promise.all(graphNodes.map(generateGraphAndUpdateNode));
};

export default graphViewer;
