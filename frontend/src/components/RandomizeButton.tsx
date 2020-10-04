import * as React from 'react'

const RandomizeButton = (props: {
  disabled?: boolean
  onClick: () => void
  title: string
}) => (
  <button type="button" disabled={props.disabled} onClick={props.onClick}>
    {props.title}
  </button>
)

export default RandomizeButton
