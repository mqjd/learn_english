import * as React from "react";
import { graphql } from "gatsby";
import Tag, { Head } from "../components/blog/tag";

type Props = {
  data: {
    allPost: any;
    [key: string]: any;
  };
  pageContext: {
    isCreatedByStatefulCreatePages: boolean;
    slug: string;
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
};

const TagComponent = ({ ...props }: Props) => {
  const {
    data: { allPost },
  } = props;

  return <Tag posts={allPost.nodes} {...props} />;
};

export default TagComponent;

export { Head };

export const query = graphql`
  query ($slug: String!, $formatString: String!) {
    allPost(
      sort: { date: DESC }
      filter: { tags: { elemMatch: { slug: { eq: $slug } } } }
    ) {
      nodes {
        slug
        title
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
