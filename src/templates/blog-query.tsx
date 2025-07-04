import * as React from "react";
import { graphql } from "gatsby";
import Blog, { Head } from "../components/blog/blog";

type Props = {
  data: {
    allPost: any;
    [key: string]: string;
  };
  [key: string]: any;
};

const BlogComponent = ({ ...props }: Props) => {
  const {
    data: { allPost },
  } = props;

  return <Blog posts={allPost.nodes} {...props} />;
};

export default BlogComponent;

export { Head };

export const query = graphql`
  query ($formatString: String!) {
    allPost(sort: { date: DESC }) {
      nodes {
        slug
        title
        deck
        date(formatString: $formatString)
        excerpt
        timeToRead
        description
        tags {
          name
          slug
        }
      }
    }
  }
`;
