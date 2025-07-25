import { merge, ThemeUIStyleObject } from 'theme-ui';
import tailwind from '@theme-ui/preset-tailwind';
import { lightThemeVars, darkThemeVars } from '../utils/prism-themes';

declare module 'theme-ui' {
  interface Theme {
    copyButton?: ThemeUIStyleObject;
    dividers?: ThemeUIStyleObject;
    carousel?: ThemeUIStyleObject;
  }
}

const theme = merge(tailwind, {
  config: {
    useCustomProperties: true,
  },
  colors: {
    ...lightThemeVars,
    toggleIcon: tailwind.colors.gray[8],
    heading: tailwind.colors.black,
    highlight: '#28292a',
    modes: {
      dark: {
        ...darkThemeVars,
        highlight: '#28292a',
        text: '#e3e3e3',
        primary: tailwind.colors.purple[4],
        secondary: `#8a9ab0`,
        toggleIcon: tailwind.colors.gray[4],
        heading: tailwind.colors.white,
        divide: tailwind.colors.gray[8],
        muted: tailwind.colors.gray[8],
        highlightLineBg: `rgba(255, 255, 255, 0.1)`,
        background: `#1f1f1f`,
        shadow: `rgba(66, 66, 66, 0.7)`,
        plain: {
          color: '#9CDCFE',
          backgroundColor: '#28292a',
        },
      },
      light: {
        ...lightThemeVars,
        highlight: '#e2e8f0',
        text: tailwind.colors.black,
        primary: tailwind.colors.purple[7],
        secondary: `#5f6c80`,
        toggleIcon: tailwind.colors.gray[8],
        heading: tailwind.colors.black,
        divide: tailwind.colors.gray[4],
        muted: tailwind.colors.gray[2],
        highlightLineBg: `rgba(0, 0, 0, 0.035)`,
        background: `#fff`,
        shadow: `rgba(33, 33, 33, 0.2)`,
        plain: {
          backgroundColor: '#f8fafd',
        },
      },
    },
  },
  fonts: {
    body: `-apple-system, BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"`,
  },
  styles: {
    root: {
      color: `text`,
      backgroundColor: `background`,
      margin: 0,
      padding: 0,
      boxSizing: `border-box`,
      textRendering: `optimizeLegibility`,
      WebkitFontSmoothing: `antialiased`,
      MozOsxFontSmoothing: `grayscale`,
      WebkitTextSizeAdjust: `100%`,
      img: {
        borderStyle: `none`,
      },
      pre: {
        fontFamily: `monospace`,
        fontSize: `1em`,
      },
      a: {
        transition: `all 0.3s ease-in-out`,
        color: `text`,
      },
    },
    p: {
      fontSize: '1em',
      letterSpacing: `-0.003em`,
      lineHeight: `body`,
      '--baseline-multiplier': 0.179,
      '--x-height-multiplier': 0.35,
      wordBreak: `break-word`,
    },
    ul: {
      li: {
        fontSize: '1em',
        letterSpacing: `-0.003em`,
        lineHeight: `body`,
        '--baseline-multiplier': 0.179,
        '--x-height-multiplier': 0.35,
      },
    },
    ol: {
      li: {
        fontSize: '1em',
        letterSpacing: `-0.003em`,
        lineHeight: `body`,
        '--baseline-multiplier': 0.179,
        '--x-height-multiplier': 0.35,
      },
    },
    h1: {
      variant: `text.heading`,
      fontSize: ['2em', '2.25em', '2.25em', '3em'],
      mt: 4,
    },
    h2: {
      variant: `text.heading`,
      fontSize: ['1.875em', '2em', '2em', '2.25em'],
      mt: 4,
    },
    h3: {
      variant: `text.heading`,
      fontSize: ['1.5em', '1.875em', '1.875em', '2em'],
      mt: 4,
    },
    h4: {
      variant: `text.heading`,
      fontSize: ['1.25em', '1.5em', '1.5em', '1.875em'],
      mt: 3,
    },
    h5: {
      variant: `text.heading`,
      fontSize: ['1em', '1.25em', '1.25em', '1.5em'],
      mt: 3,
    },
    h6: {
      variant: `text.heading`,
      fontSize: '1em',
      mb: 2,
    },
    blockquote: {
      borderLeftColor: `primary`,
      borderLeftStyle: `solid`,
      borderLeftWidth: `0.5em`,
      borderRadius: `4px`,
      bg: 'highlight',
      mx: 0,
      pl: '1em',
      pt: '0.5em',
      pb: '0.5em',
      p: {
        fontStyle: `italic`,
        mt: 0,
        mb: 0,
      },
    },
    table: {
      width: `100%`,
      my: 4,
      borderCollapse: `separate`,
      borderSpacing: 0,
      th: {
        textAlign: `left`,
        py: `4px`,
        pr: `4px`,
        pl: 0,
        borderColor: `muted`,
        borderBottomStyle: `solid`,
      },
      td: {
        textAlign: `left`,
        py: `4px`,
        pr: `4px`,
        pl: 0,
        borderColor: `muted`,
        borderBottomStyle: `solid`,
      },
    },
    th: {
      verticalAlign: `bottom`,
      borderBottomWidth: `2px`,
      color: `heading`,
    },
    td: {
      verticalAlign: `top`,
      borderBottomWidth: `1px`,
    },
    hr: {
      mx: 0,
    },
    img: {
      borderRadius: `4px`,
      boxShadow: `lg`,
      maxWidth: `100%`,
    },
  },
  layout: {
    container: {
      padding: [3, 4],
      maxWidth: `1024px`,
    },
    content: {
      figure: {
        margin: 0,
        img: {
          borderRadius: `4px`,
          boxShadow: `lg`,
          maxWidth: `100%`,
        },
      },
    },
  },
  text: {
    heading: {
      fontFamily: `heading`,
      fontWeight: `heading`,
      lineHeight: `heading`,
      color: `heading`,
    },
  },
  copyButton: {
    backgroundColor: `background`,
    border: `none`,
    color: `text`,
    cursor: `pointer`,
    fontSize: [`14px`, `14px`, `16px`],
    fontFamily: `body`,
    letterSpacing: `0.025rem`,
    transition: `all 0.3s ease-in-out`,
    '&[disabled]': {
      cursor: `not-allowed`,
    },
    ':not([disabled]):hover': {
      bg: `primary`,
      color: `white`,
    },
    position: `absolute`,
    right: 0,
    zIndex: 1,
    borderRadius: `0 0 0 0.25rem`,
    padding: `0.25rem 0.6rem`,
  },
  dividers: {
    bottom: {
      borderBottomStyle: `solid`,
      borderBottomWidth: `1px`,
      borderBottomColor: `divide`,
      pb: 3,
    },
    top: {
      borderTopStyle: `solid`,
      borderTopWidth: `1px`,
      borderTopColor: `divide`,
      pt: 3,
    },
  },
  links: {
    secondary: {
      color: `secondary`,
      textDecoration: `none`,
      ':hover': {
        color: `heading`,
        textDecoration: `underline`,
      },
      ':focus': {
        color: `heading`,
      },
    },
    listItem: {
      fontSize: ['1em', '1.25em'],
      color: `text`,
    },
  },
  messages: {
    undefined: {
      borderLeftWidth: '0.5em',
    },
  },
  buttons: {
    primary: {
      bg: 'highlight',
      cursor: 'pointer',
      color: 'text',
      '&:hover': {
        bg: `secondary`,
      },
    },
  },
  carousel: {
    button: {
      fill: `text`,
    },
    indicator: {
      default: 'text',
      current: '#03a9f4',
    },
  },
});

export default theme;
