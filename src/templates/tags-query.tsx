import * as React from "react";
import { graphql } from "gatsby";
import Tags, { Head } from "../components/blog/tags";

type Props = {
  data: {
    allPost: {
      group: {
        fieldValue: string;
        totalCount: number;
      }[];
    };
  };
  [key: string]: any;
};
const TagsComponent = ({ ...props }: Props) => {
  const {
    data: { allPost },
  } = props;

  return <Tags list={allPost.group} {...props} />;
};

export default TagsComponent;

export { Head };

export const query = graphql`
  {
    allPost(sort: { tags: { name: DESC } }) {
      group(field: { tags: { name: SELECT } }) {
        fieldValue
        totalCount
      }
    }
  }
`;
