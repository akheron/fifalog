import React from 'react'

type GapSize = 'S' | 'M' | 'L'

export interface Props {
  size?: GapSize
}

const sizes = {
  S: 8,
  M: 16,
  L: 32,
}

function getSize(size: GapSize | undefined): number {
  return sizes[size ?? 'S']
}

export const VGap = React.memo(function Gap({ size }: Props) {
  return <div style={{ marginBottom: getSize(size) }} />
})

export const HGap = React.memo(function Gap({ size }: Props) {
  return <span style={{ marginRight: getSize(size) }} />
})

export const Filler = React.memo(function Filler() {
  return <span style={{ flex: '1 0 0' }} />
})
