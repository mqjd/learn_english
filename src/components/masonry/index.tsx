/** @jsx jsx */
import * as React from 'react';
import { jsx } from 'theme-ui';
import './masonry.css';
import { Box, Flex, Label, Switch, IconButton } from 'theme-ui';
import { StudyContext, useStudyContext } from './use-study';

type MasonryItemProps = {
  title: string;
  children: React.ReactNode;
};

type MasonryProps = {
  children: React.ReactNode[];
};

const Right = (props: any) => (
  <IconButton {...props} className="button" size="12">
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <path
        d="M887.904 298.208c-12.864-12.064-33.152-11.488-45.216 1.408L415.936 753.984l-233.12-229.696C170.208 511.872 149.952 512 137.536 524.608c-12.416 12.576-12.256 32.864 0.352 45.248l256.48 252.672c0.096 0.096 0.224 0.128 0.32 0.224 0.096 0.096 0.128 0.224 0.224 0.32 2.016 1.92 4.448 3.008 6.784 4.288 1.152 0.672 2.144 1.664 3.36 2.144 3.776 1.472 7.776 2.24 11.744 2.24 4.192 0 8.384-0.832 12.288-2.496 1.312-0.544 2.336-1.664 3.552-2.368 2.4-1.408 4.896-2.592 6.944-4.672 0.096-0.096 0.128-0.256 0.224-0.352 0.064-0.096 0.192-0.128 0.288-0.224l449.184-478.208C901.44 330.592 900.768 310.336 887.904 298.208z"
        p-id="6263"
        sx={{
          fill: `#009688`,
        }}
      ></path>
    </svg>
  </IconButton>
);

const Wrong = (props: any) => (
  <IconButton {...props} className="button" size="12">
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <path
        d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z"
        p-id="6425"
        sx={{
          fill: `#f44336`,
        }}
      ></path>
    </svg>
  </IconButton>
);

const Reset = (props: any) => (
  <IconButton {...props} className="button" size="12">
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <path
        d="M816.512 368.192l-55.36 32A285.632 285.632 0 0 1 800 544c0 158.816-129.184 288-288 288-106.368 0-199.264-58.144-249.12-144.16A285.856 285.856 0 0 1 224 544c0-158.816 129.216-288 288-288v96l192-128-192-128v96C317.92 192 160 349.888 160 544c0 64.064 17.504 124 47.52 175.808C268.48 824.96 381.984 896 512 896c194.112 0 352-157.92 352-352 0-64.064-17.472-124-47.488-175.808"
        fill="#181818"
        p-id="3284"
        sx={{
          fill: `text`,
        }}
      ></path>
    </svg>
  </IconButton>
);

export const MasonryItem = ({ title, children }: MasonryItemProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<string>('span 5');

  const [contentColor, setContentColor] = React.useState<string>('text');
  const { studyMode, reset } = useStudyContext();

  React.useEffect(() => {
    setContentColor('text');
  }, [reset]);

  const updateHeight = () => {
    if (ref.current) {
      const measuredHeight = ref.current.getBoundingClientRect().height;
      const totalHeight = measuredHeight + 86;
      setHeight(`span ${Math.ceil(totalHeight / 30)}`);
    }
  };

  React.useLayoutEffect(() => {
    updateHeight();
    const img = ref.current?.querySelector('img');
    if (img && !img.complete) {
      img.onload = updateHeight;
      img.onerror = updateHeight;
    }

    const handleResize = () => {
      updateHeight();
    };
    // window.addEventListener('resize', handleResize);

    // // 清理函数
    // return () => {
    //   window.removeEventListener('resize', handleResize);
    // };
  }, [children]);
  return (
    <div className="masonry-item" style={{ gridRowEnd: height }}>
      <div
        className="masonry-item-title"
        sx={{
          borderBottomColor: `text`,
          color: contentColor,
        }}
      >
        {title}
      </div>
      <div
        className="masonry-item-content"
        ref={ref}
        sx={{
          color: `text`,
        }}
      >
        {studyMode === true && contentColor === 'text' && (
          <div className="masonry-item-skeleton">
            <Wrong
              onClick={() => setContentColor('var(--theme-ui-colors-red-5)')}
            />
            <Right
              onClick={() => setContentColor('var(--theme-ui-colors-text)')}
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const Masonry = ({ children }: MasonryProps) => {
  const [studyMode, setStudyMode] = React.useState<boolean>(false);
  const [reset, setReset] = React.useState<boolean>(false);
  const context = { studyMode, reset };

  const toogleStudyMode = () => {
    setStudyMode(!studyMode);
    setReset(!reset);
  };

  return (
    <StudyContext.Provider value={context}>
      <div className="masonry-container">
        <Flex
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Label sx={{ flex: 1 }}>学习模式</Label>
          <Box>
            <Switch
              sx={{ width: '40px' }}
              checked={studyMode}
              onChange={() => toogleStudyMode()}
            />
          </Box>
          <Reset onClick={() => setReset(!reset)} />
        </Flex>
        <div className="masonry-grid">{children}</div>
      </div>
    </StudyContext.Provider>
  );
};
