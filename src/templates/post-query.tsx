import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import Post, { Head, MBPostProps } from "../components/blog/post";

const PostComponent = ({ ...props }: PageProps<MBPostProps>) => {
  return <Post {...props} />;
};

export default PostComponent;

export { Head };

export const query = graphql`
  query ($slug: String!, $formatString: String!) {
    post(slug: { eq: $slug }) {
      slug
      title
      deck
      date(formatString: $formatString)
      tags {
        name
        slug
      }
      description
      canonicalUrl
      excerpt
      timeToRead
      banner {
        childImageSharp {
          resize(width: 1200, quality: 90) {
            src
          }
        }
      }
    }
    mdx(frontmatter: {slug: {eq: $slug}}) {
      tableOfContents
    }
  }
`;
