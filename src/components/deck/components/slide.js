/** @jsx jsx */
import { modes } from "../constants";
import Context from "../context";
import useDeck from "../hooks/use-deck";
import useSwipe from "../hooks/use-swipe";
import { jsx } from "theme-ui";

export const Slide = ({ slide, index, preview, ...props }) => {
  const outer = useDeck();
  const swipeProps = useSwipe();
  const context = {
    ...outer,
    index,
    preview,
  };

  return (
    <Context.Provider value={context}>
      <div
        {...(!preview ? swipeProps : {})}
        sx={{
          boxSizing: "border-box",
          width: "100%",
          height: context.mode === modes.print ? "100vh" : "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          color: "text",
          background: "slideBackground",
          variant: "styles.Slide",
        }}
      >
        {slide}
        <img
          sx={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            width: "120px",
            zIndex: 1000,
          }}
          alt="water mark"
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDMzIDEwIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgPGxpbmVhckdyYWRpZW50IGlkPSJwMSIgeDE9IjAiIHkxPSIwIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPg0KICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjdmYWZjIiBvZmZzZXQ9IjEwJSIvPg0KICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZTUzZTNlIiBvZmZzZXQ9IjMwJSIvPg0KICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzhhMTY5IiBvZmZzZXQ9IjUwJSIvPg0KICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZWNjOTRiIiBvZmZzZXQ9IjcwJSIvPg0KICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNDI5OWUxIiBvZmZzZXQ9IjkwJSIvPg0KICAgIDwvbGluZWFyR3JhZGllbnQ+DQogICAgPGc+DQogICAgICAgIDx0ZXh0IGZvbnQtc2l6ZT0iOCIgeD0iMCIgeT0iOCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIFRpbWVzLCAnVGltZXMgTmV3IFJvbWFuJywgc2VyaWYiIG9wYWNpdHk9Ii4xIiBmaWxsPSJ1cmwoI3AxKSI+UWlhbmdNYTwvdGV4dD4NCiAgICA8L2c+DQo8L3N2Zz4="
        />
      </div>
    </Context.Provider>
  );
};

export default Slide;
