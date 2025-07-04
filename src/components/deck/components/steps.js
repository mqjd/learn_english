/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import Appear from "./appear"
import useSteps from '../hooks/use-steps'

export const StepList = props => {
  const list = React.Children.toArray(props.children).find(child =>
    /^(ul|ol)$/.test(child.props.originalType)
  )

  // ensure this works
  const items = React.Children.toArray(list && list.props.children)

  const step = useSteps(items.length)

  const children = items.map((item, i) =>
    React.cloneElement(item, {
      style: {
        visibility: i < step ? "visible" : "hidden",
      },
    })
  )

  return React.cloneElement(list, { children })
}
export const Steps = props => {
  const list = React.Children.toArray(props.children).find(child =>
    /^(ul|ol)$/.test(child.props.originalType)
  )

  if (!list) return <Appear {...props} />
  return <StepList {...props} />
}

export default Steps
