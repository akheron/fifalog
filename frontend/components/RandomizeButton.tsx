import * as React from 'react'

const RandomizeButton = (props: { onClick: () => void; title: string }) => (
  <button type="button" onClick={props.onClick}>
    {props.title}
  </button>
)

export default RandomizeButton
