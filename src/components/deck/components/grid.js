/** @jsx jsx */
import { jsx } from "theme-ui";
import { navigate } from "@reach/router";
import useDeck from "../hooks/use-deck";
import { modes } from "../constants";
import SlideList from "./slide-list";

const Grid = ({ slides }) => {
  const { slug, setState, maximize } = useDeck();
  return (
    <div
      sx={{
        minHeight: "100vh",
      }}
    >
      <div
        sx={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <SlideList
          slides={slides}
          onClick={(i) => {
            navigate([slug, i].join("/"));
            setState({ mode: modes.normal });
          }}
          zoom={maximize ? 1 / 4 : 3 / 5}
          sx={{
            width: maximize ? "25%" : "100%",
            m: 0,
            mb: maximize ? 0 : "1em",
          }}
        />
      </div>
    </div>
  );
};

export default Grid;
