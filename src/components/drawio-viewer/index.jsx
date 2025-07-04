/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";
import { useSteps, useDeck } from "../deck";
import { useColorMode } from "theme-ui";
const resolveParams = (text) => {
  if (!text) {
    return {};
  }
  return text
    .split(";")
    .map((v) => {
      let result = {};
      if (v.indexOf("=") !== -1) {
        result[v.substring(0, v.indexOf("="))] = resoveValue(
          v.substring(v.indexOf("=") + 1)
        );
      } else {
        result[v] = true;
      }
      return result;
    })
    .reduce((prev, cur) => {
      return { ...prev, ...cur };
    });
};

const isDeckMode = (slug) => {
  return slug !== undefined;
};

const resoveValue = (value) => {
  if (value.length === 0) {
    return "";
  }

  if ("null" === value) {
    return null;
  }

  if (!isNaN(value)) {
    return +value;
  }

  if ("true" === value) {
    return true;
  }

  if ("false" === value) {
    return false;
  }
  return value;
};

const style = {
  width: "100%",
  height: "100%",
  maxHeight: "100%",
  maxWidth: "100%",
  overflow: "hidden",
};

const DrawioViewer = (prop) => {
  const [colorMode] = useColorMode();
  const [graphView, setGraphView] = React.useState(null);
  const { index, slug } = useDeck();
  const inDeck = isDeckMode(slug);

  const defaultProps = {
    toolbar: inDeck ? null : prop.toolbar || null,
    "auto-fit": true,
  };
  const params = resolveParams(prop.param);
  const step = useSteps(params.steps ? params.steps - 1 : 0);
  React.useEffect(() => {
    if (params.steps) {
      graphView && step !== graphView.currentPage && graphView.selectPage(step);
    }
  }, [step, graphView, params]);

  const darkMode = params["dark-mode"];
  React.useEffect(() => {
    if (!graphView || darkMode !== undefined) return;
    if (colorMode === "dark") {
      graphView.darkMode = true;
      graphView.graph.container.classList.add("geDarkMode");
      graphView.toolbar && graphView.toolbar.classList.add("geDarkMode");
    } else {
      graphView.darkMode = false;
      graphView.graph.container.classList.remove("geDarkMode");
      graphView.toolbar && graphView.toolbar.classList.remove("geDarkMode");
    }
  }, [colorMode, graphView, darkMode]);

  const container = React.useRef(null);
  const initDrawioViewer = () => {
    return new Promise((resolve, reject) => {
      let win = window;
      win.GraphViewer.getUrl(prop.url, function (e) {
        resolve(
          new win.GraphViewer(
            container.current,
            win.mxUtils.parseXml(e).documentElement,
            {
              "dark-mode": colorMode === "dark",
              ...prop,
              ...defaultProps,
              ...params,
            }
          )
        );
      });
    });
  };
  React.useEffect(() => {
    initDrawioViewer().then((v) => {
      setGraphView(v);
    });
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <React.StrictMode>
      <div style={style} ref={container}></div>
    </React.StrictMode>
  );
};

export default DrawioViewer;
