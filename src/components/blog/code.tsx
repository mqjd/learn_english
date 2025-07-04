import * as React from "react";
import { useColorMode } from "theme-ui";
import { Highlight, Prism } from "prism-react-renderer";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import {
  calculateLinesToHighlight,
  getLanguage,
  GetLanguageInput,
} from "@lekoarts/themes-utils";
import Copy from "./copy";
import useMinimalBlogConfig from "../../hooks/use-minimal-blog-config";
import { lightTheme, darkTheme } from "../../utils/prism-themes";

type CodeProps = {
  codeString: string;
  withLineNumbers?: boolean;
  highlight?: string;
  title?: string;
  className: GetLanguageInput;
  metastring?: string;
  [key: string]: any;
};

const LazyLiveProvider = (props: any) => (
  <LiveProvider {...props}>
    {props.showCopyButton && <Copy content={props.code} />}
    {!props.hideLiveEditor && <LiveEditor data-name="live-editor" />}
    <LiveError />
    <LivePreview data-name="live-preview" />
  </LiveProvider>
);

const Code = ({
  codeString,
  noLineNumbers = false,
  title = ``,
  className: blockClassName,
  highlight = ``,
  metastring = ``,
  ...props
}: CodeProps) => {
  const { showLineNumbers, showCopyButton } = useMinimalBlogConfig();
  const [colorMode] = useColorMode<"light" | "dark">();
  const isDark = colorMode === `dark`;

  const language = getLanguage(blockClassName);
  const shouldHighlightLine = calculateLinesToHighlight(highlight);
  const shouldShowLineNumbers =
    noLineNumbers === false ? showLineNumbers : !noLineNumbers;
  const shouldHideLiveEditor = metastring.indexOf("hideLiveEditor") !== -1;

  if (props[`react-live`]) {
    return (
      <div className="react-live-wrapper">
        <LazyLiveProvider
          code={codeString}
          noInline
          theme={isDark ? darkTheme : lightTheme}
          showCopyButton={showCopyButton}
          hideLiveEditor={shouldHideLiveEditor}
        />
      </div>
    );
  }
  return (
    <Highlight
      code={codeString}
      // @ts-ignore
      language={language}
      theme={isDark ? darkTheme : lightTheme}
    >
      {({ className, tokens, getLineProps, getTokenProps }) => (
        <React.Fragment>
          <div className="gatsby-highlight" data-language={language}>
            {title && (
              <div className="code-title">
                <div>{title}</div>
              </div>
            )}
            <pre className={className} data-linenumber={shouldShowLineNumbers}>
              {showCopyButton && <Copy content={codeString} fileName={title} />}
              <code className={`code-content language-${language}`}>
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line, key: i });

                  if (shouldHighlightLine(i)) {
                    lineProps.className = `${lineProps.className} highlight-line`;
                    lineProps.style = {
                      ...lineProps.style,
                      backgroundColor: `var(--theme-ui-colors-highlightLineBg)`,
                    };
                  }

                  return (
                    <div {...lineProps}>
                      {shouldShowLineNumbers && (
                        <span className="line-number-style">{i + 1}</span>
                      )}
                      {line.map((token, key) => (
                        <span {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        </React.Fragment>
      )}
    </Highlight>
  );
};

export default Code;
