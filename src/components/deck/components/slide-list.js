/** @jsx jsx */
import { jsx } from "theme-ui";
import React, { useEffect, useRef } from "react";
import Zoom from "./zoom";
import Slide from "./slide";
import useDeck from "../hooks/use-deck";
import { modes } from "../constants";

const noop = () => {};

const SlideList = ({
  slides = [],
  ratio = 16 / 9,
  zoom = 1 / 4,
  onClick = noop,
  ...props
}) => {
  const { index, maximize, mode } = useDeck();
  const thumb = useRef(null);
  const operateAble = maximize || mode !== modes.grid;
  useEffect(() => {
    const el = thumb.current;
    if (!el) return;
    if (typeof el.scrollIntoViewIfNeeded === "function") {
      el.scrollIntoViewIfNeeded();
    }
  });

  return (
    <React.Fragment>
      {slides.map((slide, i) => (
        <div
          {...props}
          key={i}
          role="presentation"
          ref={i === index ? thumb : null}
          onKeyDown={() => {}}
          onClick={(e) => {
            operateAble && onClick(i);
          }}
          style={
            index === i
              ? {
                  position: "relative",
                  zIndex: 1,
                }
              : null
          }
          sx={{
            m: 2,
            cursor: operateAble ? "pointer" : "auto",
            outline: operateAble
              ? index === i
                ? `4px solid #ff9800`
                : null
              : null,
          }}
        >
          <Zoom zoom={zoom} ratio={ratio}>
            <Slide slide={slide} preview />
          </Zoom>
        </div>
      ))}
    </React.Fragment>
  );
};

export default SlideList;
