import React from 'react'

import TextButton from './TextButton'
import { HGap } from './whitespace'

export interface Props {
  page: number
  setPage: (page: number) => void
  pageSize: number
  total: number
}

const ellipsis = Symbol()

export default React.memo(function Pagination({
  page,
  setPage,
  pageSize,
  total,
}: Props) {
  const adjacent = 2

  const totalPages = Math.ceil(total / pageSize)
  if (totalPages == 1) return null

  const start = Math.max(1, page - adjacent)
  const end = Math.min(totalPages, page + adjacent)

  const pages = [
    1 < page - adjacent ? 1 : null,
    2 < page - adjacent - 1 ? ellipsis : null,
    2 === page - adjacent - 1 ? 2 : null,
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    page + adjacent + 1 == totalPages - 1 ? totalPages - 1 : null,
    page + adjacent + 1 < totalPages - 1 ? ellipsis : null,
    page + adjacent < totalPages ? totalPages : null,
  ].flatMap((p) => (p == null ? [] : p))

  return (
    <div>
      {pages
        .flatMap((p, i) => [
          typeof p === 'symbol' ? (
            '...'
          ) : p === page ? (
            <span key={p}>{p}</span>
          ) : (
            <TextButton key={p} onClick={() => setPage(p)}>
              {p}
            </TextButton>
          ),
          <HGap key={`gap${i}`} />,
        ])
        .slice(0, -1)}
    </div>
  )
})
