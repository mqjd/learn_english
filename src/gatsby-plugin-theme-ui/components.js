/* eslint react/prop-types: 0 */
import { preToCodeBlock } from "@lekoarts/themes-utils";
import * as React from "react";
import { Text } from "theme-ui";
import Code from "../components/blog/code";
import * as mdxComponents from "../components/deck/components";
import DrawioViewer from "../components/drawio-viewer";
import Carousel from "../components/carousel";
import Title from "../components/blog/title";

const components = {
  Text: ({ children, ...props }) => <Text {...props}>{children}</Text>,
  Title: ({ children, text, ...props }) => (
    <Title text={text} {...props}>
      {children}
    </Title>
  ),
  Carousel,
  ...mdxComponents,
  DrawioViewer: ({ children, ...props }) => (
    <DrawioViewer {...props}></DrawioViewer>
  ),
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
