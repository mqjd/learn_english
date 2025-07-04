import React from "react"

export const onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  const {
    plugins, // internal to gatsby
    disable, // should we disable the plugin ?
    src, // source of the script
    onerror,
    onError,
    onload,
    onLoad,
    charset = "utf8",
    type = "text/javascript",
    ...options
  } = pluginOptions.script

  if (!src) {
    throw new Error(
      'gatsby-remark-drawio needs a "src" option link to viewer.min.js'
    )
  }

  const finalOptions = {
    src,
    onerror: onError || onerror,
    onload: onLoad || onload,
    type,
    charset,
    ...options,
  }
  if (!("async" in finalOptions) && !("defer" in finalOptions)) {
    // Async should be true by default
    finalOptions["async"] = true
  }
  const optionArray = []
  Object.entries(finalOptions).forEach(([property, value]) => {
    if (value === undefined || value === false) {
      return
    }
    if (property === "onerror" || property === "onload") {
      optionArray.push(`script.setAttribute("${property}", ${value});`)
    } else if (value === true) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
      optionArray.push(`script.setAttribute("${property}", "");`)
    } else {
      optionArray.push(`script.setAttribute("${property}", "${value}");`)
    }
  })
  if (!disable)
    setPostBodyComponents([
      <script
        key={src}
        dangerouslySetInnerHTML={{
          __html: [
            'var head = document.head || document.getElementsByTagName("head")[0];',
            'var script = document.createElement("script");',
            ...optionArray,
            "head.appendChild(script);",
          ].join(process.env.NODE_ENV === "production" ? "" : "\n"),
        }}
      />,
    ])
}
