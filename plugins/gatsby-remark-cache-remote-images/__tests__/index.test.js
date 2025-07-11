import plugin from '../';
import remarkGfm from 'remark-gfm';
import { createProcessor } from '@mdx-js/mdx';
import rehypeMetaAsAttributes from '@lekoarts/rehype-meta-as-attributes';

const md = `
![grill](https://www.tasteofhome.com/wp-content/uploads/2025/04/GettyImages-1026596996-e1745862120435.jpg)
`;

test(`gatsby-remark-masonry test`, async () => {
  const markdownAST = createProcessor({
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeMetaAsAttributes],
  }).parse(md);
  await plugin(
    { markdownAST },
    { saveImageTo: '/Users/mq/IdeaProjects/learn_english/tmp' }
  );
  console.log(markdownAST);
});
