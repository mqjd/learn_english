/** @jsx jsx */
import * as React from 'react'
import { jsx } from 'theme-ui'
import './masonry.css'
import { Box, Flex, Label, Switch, IconButton } from 'theme-ui'
import {
  StudyContext,
  useStudyContext,
  GlobalStudyContext,
  useGlobalStudyContext
} from './use-study'

type MasonryItemProps = {
  title: string
  children: React.ReactNode
}

type MasonryProps = {
  itemCount: number
  useStudyMode: boolean
  children: React.ReactNode[]
}

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
          fill: `#009688`
        }}
      ></path>
    </svg>
  </IconButton>
)

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
          fill: `#f44336`
        }}
      ></path>
    </svg>
  </IconButton>
)

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
          fill: `text`
        }}
      ></path>
    </svg>
  </IconButton>
)

export const MasonryItem = ({ title, children }: MasonryItemProps) => {
  const tittleRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<string>('span 5')
  const paddingHeight = 30

  const [contentColor, setContentColor] = React.useState<string>('text')
  const { studySwitch, resetSwitch, addSuccessCount, addFailedCount } = useStudyContext()

  React.useEffect(() => {
    setContentColor('text')
  }, [resetSwitch])

  const markSuccess = () => {
    setContentColor('var(--theme-ui-colors-green-5)')
    addSuccessCount()
  }

  const markFailed = () => {
    setContentColor('var(--theme-ui-colors-red-5)')
    addFailedCount()
  }

  const updateHeight = () => {
    if (contentRef.current && tittleRef.current) {
      const measuredTittleHeight = tittleRef.current.getBoundingClientRect().height
      const measuredContentHeight = contentRef.current.getBoundingClientRect().height
      const totalHeight = measuredContentHeight + measuredTittleHeight + paddingHeight + 1
      setHeight(`span ${Math.ceil(totalHeight / 30 + 1)}`)
    }
  }

  React.useLayoutEffect(() => {
    updateHeight()
    const img = contentRef.current?.querySelector('img')
    if (img && !img.complete) {
      img.onload = updateHeight
      img.onerror = updateHeight
    }

    const handleResize = () => {
      updateHeight()
    }
    // window.addEventListener('resize', handleResize);

    // // 清理函数
    // return () => {
    //   window.removeEventListener('resize', handleResize);
    // };
  }, [children])
  return (
    <div className="masonry-item" style={{ gridRowEnd: height }}>
      <div
        className="masonry-item-title"
        ref={tittleRef}
        sx={{
          borderBottomColor: `text`,
          color: contentColor
        }}
      >
        {title}
      </div>
      <div
        className="masonry-item-content"
        ref={contentRef}
        sx={{
          color: `text`
        }}
      >
        {studySwitch === true && contentColor === 'text' && (
          <div className="masonry-item-skeleton">
            <Wrong onClick={() => markFailed()} />
            <Right onClick={() => markSuccess()} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export const Masonry = ({ children, itemCount, useStudyMode }: MasonryProps) => {
  const { globalStudySwitch, globalResetSwitch, addGlobalSuccessCount, addGlobalFailedCount } =
    useGlobalStudyContext()

  const [studySwitch, setStudySwitch] = React.useState<boolean>(false)
  const [resetSwitch, setResetSwitch] = React.useState<boolean>(false)
  const [successCount, setSuccessCount] = React.useState<number>(0)
  const [failedCount, setFailedCount] = React.useState<number>(0)
  const addSuccessCount = () => {
    setSuccessCount(successCount + 1)
    addGlobalSuccessCount()
  }

  const addFailedCount = () => {
    setFailedCount(failedCount + 1)
    addGlobalFailedCount()
  }

  const toogleStudyMode = () => {
    setStudySwitch(!studySwitch)
    setResetSwitch(!resetSwitch)
  }

  const resetStudy = () => {
    setResetSwitch(!studySwitch)
    addGlobalSuccessCount(-successCount)
    addGlobalFailedCount(-failedCount)
    setSuccessCount(0)
    setFailedCount(0)
  }

  const context = {
    successCount,
    failedCount,
    studySwitch,
    resetSwitch,
    addSuccessCount,
    addFailedCount
  }

  React.useEffect(() => {
    setStudySwitch(globalStudySwitch)
  }, [globalStudySwitch])

  React.useEffect(() => {
    setResetSwitch(!resetSwitch)
  }, [globalResetSwitch])

  return (
    <StudyContext.Provider value={context}>
      <div className="masonry-container">
        {useStudyMode && (
          <Flex
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}
          >
            <Label sx={{ flex: 1, color: `var(--theme-ui-colors-tag-color)` }}>Study Mode</Label>
            <span sx={{ mr: '1em' }}>
              <span sx={{ color: `var(--theme-ui-colors-grey-5)` }}>
                {itemCount - successCount - failedCount}
              </span>
              <span sx={{ color: `var(--theme-ui-colors-green-5)` }}>-{successCount}</span>
              <span sx={{ color: `var(--theme-ui-colors-red-5)` }}>-{failedCount}</span>
            </span>
            <Box>
              <Switch
                sx={{ width: '40px' }}
                checked={studySwitch}
                onChange={() => toogleStudyMode()}
              />
            </Box>
            <Reset onClick={resetStudy} />
          </Flex>
        )}

        <div className="masonry-grid">{children}</div>
      </div>
    </StudyContext.Provider>
  )
}

export const GlobalMasonry = ({ children, itemCount, useStudyMode }: MasonryProps) => {
  const [globalStudySwitch, setGlobalStudyMode] = React.useState<boolean>(false)
  const [globalResetSwitch, setGlobalReset] = React.useState<boolean>(false)
  const [globalSuccessCount, setGlobalSuccessCount] = React.useState<number>(0)
  const [globalFailedCount, setGlobalFailedCount] = React.useState<number>(0)

  const addGlobalSuccessCount = (num: number = 1) => {
    setGlobalSuccessCount(globalSuccessCount + num)
  }

  const addGlobalFailedCount = (num: number = 1) => {
    setGlobalFailedCount(globalFailedCount + num)
  }

  const toogleGlobalStudyMode = () => {
    setGlobalStudyMode(!globalStudySwitch)
    setGlobalReset(!globalResetSwitch)
  }

  const resetStudy = () => {
    setGlobalReset(!globalResetSwitch)
    setGlobalSuccessCount(0)
    setGlobalFailedCount(0)
  }

  const context = {
    globalStudySwitch,
    globalResetSwitch,
    globalSuccessCount,
    globalFailedCount,
    addGlobalSuccessCount,
    addGlobalFailedCount
  }

  return (
    <GlobalStudyContext.Provider value={context}>
      {useStudyMode && (
        <Flex
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2
          }}
        >
          <Label sx={{ flex: 1, color: `var(--theme-ui-colors-tag-color)` }}>
            Global Study Mode
          </Label>
          <span sx={{ mr: '1em' }}>
            <span sx={{ color: `var(--theme-ui-colors-grey-5)` }}>
              {itemCount - globalSuccessCount - globalFailedCount}
            </span>
            <span sx={{ color: `var(--theme-ui-colors-green-5)` }}>-{globalSuccessCount}</span>
            <span sx={{ color: `var(--theme-ui-colors-red-5)` }}>-{globalFailedCount}</span>
          </span>
          <Box>
            <Switch
              sx={{ width: '40px' }}
              checked={globalStudySwitch}
              onChange={() => toogleGlobalStudyMode()}
            />
          </Box>
          <Reset onClick={resetStudy} />
        </Flex>
      )}
      {children}
    </GlobalStudyContext.Provider>
  )
}
