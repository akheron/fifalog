import * as React from 'react'

type Props = { onClick: () => void }

export default ({ onClick }: Props) => (
  <button type="button" onClick={onClick}>
    Get random teams!
  </button>
)
