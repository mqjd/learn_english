import remarkGfm from 'remark-gfm';
import { createProcessor } from '@mdx-js/mdx';
import rehypeMetaAsAttributes from '@lekoarts/rehype-meta-as-attributes';

import plugin from '../';

const md = `

# title

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
