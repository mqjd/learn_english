/** @jsx jsx */
import { modes } from "../constants";
import useDeck from "../hooks/use-deck";
import React, { Fragment, useEffect } from "react";
import { jsx } from "theme-ui";

const DefaultProvider = (props) =>
  React.createElement(Fragment, null, props.children);

const Wapper = (props) => {
  const { mode, theme } = useDeck();

  useEffect(() => {
    // handle mobile safari height

    const stopTouch = (e) => {
      if (mode !== modes.normal) return;
      e.preventDefault();
    };
    document.body.addEventListener("touchstart", stopTouch);
    return () => {
      document.body.removeEventListener("touchstart", stopTouch);
    };
  }, [mode]);// eslint-disable-line react-hooks/exhaustive-deps

  const { Provider = DefaultProvider } = theme;

  return (
    <Provider>
      <div
        {...props}
        sx={{
          width: "100%",
          height: mode !== modes.print ? "100%" : "100vh",
          variant: "styles.root",
          "*": {
            boxSizing: "border-box",
          },
        }}
      />
    </Provider>
  );
};

export default Wapper;
