/** @jsx jsx */
import type { HeadFC, PageProps } from 'gatsby';
import * as React from 'react';
import { jsx, Heading } from 'theme-ui';
import Layout from './layout';
import ItemTags from './item-tags';
import Seo from './seo';
import PostFooter from './post-footer';
import './post.css';
import type { TableOfContentItemProps } from './table-of-content';
import { TableOfContent } from './table-of-content';

export type MBPostProps = {
  post: {
    slug: string;
    title: string;
    date: string;
    tags?: {
      name: string;
      slug: string;
    }[];
    description?: string;
    canonicalUrl?: string;
    excerpt: string;
    timeToRead?: number;
    banner?: {
      childImageSharp: {
        resize: {
          src: string;
        };
      };
    };
  };
  mdx: {
    tableOfContents: TableOfContentItemProps;
  };
};

const px = [`16px`, `8px`, `4px`];
const shadow = px.map((v) => `rgba(0, 0, 0, 0.1) 0px ${v} ${v} 0px`);

const Post: React.FC<React.PropsWithChildren<PageProps<MBPostProps>>> = ({
  data: { post, mdx },
  children,
}) => (
  <Layout>
    <Heading as="h1" variant="styles.h1">
      {post.title}
    </Heading>
    <p
      sx={{
        color: `secondary`,
        mt: 3,
        a: { color: `secondary` },
        fontSize: ['1em', '1.25em'],
      }}
    >
      <time>{post.date}</time>
      {post.tags && (
        <React.Fragment>
          {` — `}
          <ItemTags tags={post.tags} />
        </React.Fragment>
      )}
      {post.timeToRead && ` — `}
      {post.timeToRead && <span>{post.timeToRead} min read</span>}
    </p>
    <section
      className="post"
      sx={{
        my: 5,
        '.gatsby-resp-image-wrapper': {
          my: [4, 4, 5],
          borderRadius: `4px`,
          boxShadow: shadow.join(`, `),
          '.gatsby-resp-image-image': {
            borderRadius: `4px`,
          },
        },
        variant: `layout.content`,
      }}
    >
      {children}
    </section>
    {mdx.tableOfContents.items && <TableOfContent {...mdx.tableOfContents} />}
    <PostFooter post={post} mdx={mdx} />
  </Layout>
);

export default Post;

export const Head: HeadFC<MBPostProps> = ({ data: { post } }) => (
  <Seo
    title={post.title}
    description={post.description ? post.description : post.excerpt}
    image={post.banner ? post.banner?.childImageSharp?.resize?.src : undefined}
    pathname={post.slug}
    canonicalUrl={post.canonicalUrl}
  />
);
