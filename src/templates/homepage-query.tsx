import * as React from "react";
import { graphql } from "gatsby";
import Homepage, { Head } from "../components/blog/homepage";

type Props = {
  data: {
    allPost: any;
    [key: string]: string;
  };
  [key: string]: any;
};

const HomepageComponent = ({ ...props }: Props) => {
  const {
    data: { allPost },
  } = props;

  return <Homepage posts={allPost.nodes} {...props} />;
};

export default HomepageComponent;

export { Head };

export const query = graphql`
  query ($formatString: String!) {
    allPost(sort: { date: DESC }, limit: 3) {
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
