/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";
import Zoom from "./zoom";
import useDeck from "../hooks/use-deck";
import { modes } from "../constants";
import { invert } from "@theme-ui/color";

const wapperStyle = (maximize) => {
  if (maximize) {
    return {
      position: "fixed",
      top: "0px",
      left: "0px",
      width: "100vw",
      height: "100vh",
    };
  } else {
    return {
      width: "100%",
      height: "0px",
      pt: "calc(100% * 9/16)",
      overflow: "hidden",
      position: "relative",
    };
  }
};

const FullScreen = () => {
  const { setMaximize, maximize } = useDeck();
  return (
    <span
      role="presentation"
      onKeyDown={() => {}}
      onClick={() => setMaximize()}
      className="full-screen-button"
      sx={{
        width: "60px",
        height: "60px",
        boxSizing: "border-box",
        position: "absolute",
        right: "0px",
        p: "20px",
        zIndex: 1000,
        cursor: "pointer",
      }}
    >
      {maximize ? (
        <svg viewBox="0 0 1024 1024">
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M786.752 877.248 933.504 1024 1024 933.504 877.248 786.752 1024 640 640 640 640 1024Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M0 384 384 384 384 0 237.248 146.752 92 1.376 1.504 91.872 146.752 237.248Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M0 933.504 90.496 1024 237.248 877.248 384 1024 384 640 0 640 146.752 786.752Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M640 384 1024 384 877.248 237.248 1022.752 91.872 932.256 1.376 786.752 146.752 640 0Z"
          ></path>
        </svg>
      ) : (
        <svg viewBox="0 0 1024 1024">
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M877.248 786.752 730.496 640 640 730.496 786.752 877.248 640 1024 1024 1024 1024 640Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M384 0 0 0 0 384 146.752 237.248 292 382.496 382.496 292 237.248 146.752Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M384 730.496 293.504 640 146.752 786.752 0 640 0 1024 384 1024 237.248 877.248Z"
          ></path>
          <path
            sx={{ fill: invert("slideBackground") }}
            d="M1024 0 640 0 786.752 146.752 641.344 292 731.84 382.496 877.248 237.248 1024 384Z"
          ></path>
        </svg>
      )}
    </span>
  );
};

const SlideWapper = ({ children }) => {
  const { maximize, mode } = useDeck();
  if (maximize || mode !== modes.grid) {
    return (
      <div sx={wapperStyle(maximize)}>
        <div
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0px",
            left: "0px",
            overflow: "auto",
          }}
        >
          <FullScreen />
          <Zoom zoom={maximize ? 1 : 9 / 16}>
            <React.Fragment children={children} />
          </Zoom>
        </div>
      </div>
    );
  } else {
    return (
      <div sx={{ background: invert("background") }}>
        <React.Fragment children={children} />
      </div>
    );
  }
};

export default SlideWapper;
