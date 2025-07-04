import _ from "lodash";
import HtmlToJsx from "htmltojsx";
import { mdxjs } from "micromark-extension-mdxjs";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { optimize } from 'svgo';

const SvgToJsx = new HtmlToJsx({ createClass: false });

export const toCarouselNode = (content) => {
  const nodes = content.map(toSingleNode);

  return {
    type: "mdxJsxFlowElement",
    name: "Carousel",
    attributes: [],
    children: nodes,
    data: {
      _mdxExplicitJsx: true,
    },
  };
};

export const toSingleNode = (content) => {
  const optimizedSvg = optimize(content, {
    multipass: true,
  });
  const tree = fromMarkdown(SvgToJsx.convert(optimizedSvg.data), {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });
  const node = findSvgNode(tree);
  node.data = {
    _mdxExplicitJsx: true,
  };
  return node;
};

export const findSvgNode = (node) => {
  if (node.name === "svg") {
    return node;
  }
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const result = findSvgNode(node.children[i]);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const toReactSyntax = (node) => {
  node.position = null;
  node.data = {
    _mdxExplicitJsx: true,
  };
  if (node.attributes) {
    node.attributes = node.attributes.filter(
      (v) => ["data-drawio-colors", "requiredFeatures"].indexOf(v.name) === -1
    );
    node.attributes.forEach((v) => {
      if (v.name === "style") {
        v.value = {
          type: "mdxJsxAttributeValueExpression",
          value: JSON.stringify(parse.default(v.value)),
        };
      }
      v.name = _.camelCase(v.name.replace(/(-|:)/g, "_"));
    });
  }
  if (node.children) {
    node.children.forEach(toReactSyntax);
  }
};
