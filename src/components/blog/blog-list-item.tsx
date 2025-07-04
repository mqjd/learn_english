/** @jsx jsx */
import * as React from "react";
import { jsx, Box } from "theme-ui";
import { Link } from "gatsby";
import ItemTags from "./item-tags";

type BlogListItemProps = {
  post: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    description: string;
    timeToRead?: number;
    tags?: {
      name: string;
      slug: string;
    }[];
  };
  showTags?: boolean;
};

const BlogListItem = ({ post, showTags = true }: BlogListItemProps) => (
  <Box mb={4}>
    <Link
      to={post.slug}
      sx={(t: any) => ({
        ...t.styles?.a,
        fontSize: ["1.25em", "1.5em"],
        color: `text`,
      })}
    >
      {post.title}
    </Link>
    <p
      sx={{
        color: `secondary`,
        mt: 1,
        a: { color: `secondary` },
        fontSize: ["1em", "1.25em"],
      }}
    >
      <time>{post.date}</time>
      {post.tags && showTags && (
        <React.Fragment>
          {` — `}
          <ItemTags tags={post.tags} />
        </React.Fragment>
      )}
    </p>
  </Box>
);

export default BlogListItem;
