/* eslint react/prop-types: 0 */
import { preToCodeBlock } from "@lekoarts/themes-utils";
import * as React from "react";
import { Text } from "theme-ui";
import Code from "../components/blog/code";
import Title from "../components/blog/title";
import * as MasonryComponents from "../components/masonry";

const components = {
  Text: ({ children, ...props }) => <Text {...props}>{children}</Text>,
  Title: ({ children, text, ...props }) => (
    <Title text={text} {...props}>
      {children}
    </Title>
  ),
  ...MasonryComponents,
  pre: (preProps) => {
    const props = preToCodeBlock(preProps);
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />;
    }
    // it's possible to have a pre without a code in it
    return <pre {...preProps} />;
  }
};

export default components;
