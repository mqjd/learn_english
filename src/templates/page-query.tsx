import * as React from "react";
import { graphql } from "gatsby";
import type { PageProps } from "gatsby";
import Page, { Head, MBPageProps } from "../components/blog/page";

const PageComponent = ({ ...props }: PageProps<MBPageProps>) => {
  return <Page {...props} />;
};

export default PageComponent;
export { Head };

export const query = graphql`
  query ($slug: String!) {
    page(slug: { eq: $slug }) {
      title
      slug
      excerpt
    }
    mdx(frontmatter: {slug: {eq: $slug}}) {
      tableOfContents
    }
  }
`;
