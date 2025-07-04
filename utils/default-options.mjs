const options = {
  basePath: `/`,
  relativePath: `/learn_english`,
  blogPath: `/blog`,
  postsPath: `./docs/posts`,
  postsPrefix: `/`,
  pagesPath: `./docs/pages`,
  tagsPath: `/tags`,
  navigation: [
    {
      title: `Blog`,
      slug: `/blog`,
    },
    {
      title: `BookMark`,
      slug: `/bookmark`,
    },
    {
      title: `About`,
      slug: `/about`,
    },
  ],
  externalLinks: [
    {
      name: `Github`,
      url: `https://github.com/mqjd`,
    },
  ],
  showLineNumbers: true,
  showCopyButton: true,
  formatString: `YYYY-MM-DD`,
  sharp: true,
  mdx: true,
};
export default options;
