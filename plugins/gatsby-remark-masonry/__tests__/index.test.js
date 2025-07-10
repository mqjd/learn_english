import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import { createProcessor } from '@mdx-js/mdx';
const remarkMdx = require('remark-mdx');
import rehypeMetaAsAttributes from '@lekoarts/rehype-meta-as-attributes';

import plugin from '../';

const toHAST = require(`mdast-util-to-hast`);
const hastToHTML = require(`hast-util-to-html`);

const Remark = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkStringify)
  .freeze();

const remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
});

const createNode = (content) => {
  const node = {
    id: 1234,
  };

  const markdownNode = {
    id: `${node.id} >>> MarkdownRemark`,
    children: [],
    parent: node.id,
    internal: {
      content,
      contentDigest: `some-hash`,
      type: `MarkdownRemark`,
    },
  };

  markdownNode.frontmatter = {
    title: ``, // always include a title
    parent: node.id,
  };

  return markdownNode;
};

const createPluginOptions = (content, getRemarkFileDependency = false) => {
  const ast = remark.parse(content);
  const dirName = 'not-real';
  return {
    files: [],
    markdownNode: ast,
    markdownAST: remark.parse(content),
    getNode: () => {
      return {
        dir: dirName,
      };
    },
    compiler: {
      parseString: remark.parse.bind(remark),
      generateHTML: (node) => hastToHTML(toHAST(node)),
    },
    getRemarkFileDependency,
  };
};

const md = `


{ /* table-style: masonry;theme:dark */ }

| Word          | Explain                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| taco            | A taco is a crispy Mexican pancake made from corn and eggs, which is folded and filled with meat, vegetables, and a spicy sauce. <br/>![taco](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIi66HnFYBiXcxxJORXn089VWo9DfKxoVuYDNNcR6pE1GNPXVfCMUVc3RlqfO-ogztO1Y&usqp=CAU)                                                                                                                      |


`;

test(`gatsby-remark-masonry test`, async () => {
  const markdownAST = createProcessor({
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeMetaAsAttributes],
  }).parse(md);

  plugin({ markdownAST });

  console.log(markdownAST);
});
