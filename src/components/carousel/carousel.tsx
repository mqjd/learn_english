/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import "./carousel.css";

type CarouselProps = {
  children: React.ReactNode[];
};

const Left = (props: any) => (
  <button {...props} className="button" style={{ left: 10 }}>
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <path
        d="M938.666667 1006.933333h-375.466667c-3.413333 0-10.24-3.413333-13.653333-3.413333l-477.866667-477.866667c-6.826667-6.826667-6.826667-17.066667 0-23.893333l477.866667-477.866667c3.413333-3.413333 6.826667-3.413333 13.653333-3.413333h375.466667c6.826667 0 13.653333 3.413333 17.066666 10.24s0 13.653333-3.413333 17.066667L484.693333 512l464.213334 464.213333c6.826667 6.826667 6.826667 13.653333 6.826666 20.48s-10.24 10.24-17.066666 10.24z m-368.64-34.133333h327.68L447.146667 525.653333c-6.826667-6.826667-6.826667-17.066667 0-23.893333L897.706667 51.2h-327.68L109.226667 512l460.8 460.8z"
        sx={{
          variant: `carousel.button`,
        }}
      ></path>
    </svg>
  </button>
);

const Right = (props: any) => (
  <button {...props} className="button" style={{ right: 10 }}>
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="27069"
      width="100%"
      height="100%"
    >
      <path
        d="M460.8 1006.933333h-375.466667c-6.826667 0-13.653333-3.413333-17.066666-10.24s0-13.653333 3.413333-17.066666L539.306667 512 71.68 47.786667C68.266667 40.96 68.266667 34.133333 68.266667 27.306667s10.24-10.24 17.066666-10.24h375.466667c3.413333 0 10.24 3.413333 13.653333 3.413333l477.866667 477.866667c6.826667 6.826667 6.826667 17.066667 0 23.893333l-477.866667 477.866667c-3.413333 3.413333-10.24 6.826667-13.653333 6.826666z m-334.506667-34.133333h327.68L914.773333 512 453.973333 51.2H126.293333l447.146667 447.146667c6.826667 6.826667 6.826667 17.066667 0 23.893333L126.293333 972.8z"
        sx={{
          variant: `carousel.button`,
        }}
      ></path>
    </svg>
  </button>
);

const Carousel = ({ children }: CarouselProps) => {
  const [current, setCurrent] = React.useState(0);
  const total = children.length;
  const next = () => {
    setCurrent((current + 1) % total);
  };
  const prev = () => {
    setCurrent((current - 1 + total) % total);
  };
  return (
    <div className="carousel">
      <div className="carousel-container">
        <Left onClick={() => prev()} />
        {children[current]}
        <Right onClick={() => next()} />
        <div className="indicator-container">
          {new Array(total).fill(null).map((item, index) => {
            return (
              <div
                key={index}
                className="indicator"
                sx={(theme: any) => {
                  return {
                    bg:
                      index === current
                        ? theme.carousel.indicator.current
                        : theme.carousel.indicator.default,
                  };
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
