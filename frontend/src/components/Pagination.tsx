import React from 'react'

import TextButton from './TextButton'
import { HGap } from './whitespace'

export interface Props {
  page: number
  setPage: (page: number) => void
  pageSize: number
  total: number
}

export default React.memo(function Pagination({
  page,
  setPage,
  pageSize,
  total,
}: Props) {
  const totalPages = Math.ceil(total / pageSize)
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const elems = [
    page > 1 ? (
      <TextButton key="first" onClick={() => setPage(1)}>
        &laquo;
      </TextButton>
    ) : null,
    page > start ? (
      <TextButton key="prev" onClick={() => setPage(page - 1)}>
        &lsaquo;
      </TextButton>
    ) : null,
    ...pages.map((p) =>
      p === page ? (
        <span key={`page${p}`}>{p}</span>
      ) : (
        <TextButton key={`page${p}`} onClick={() => setPage(p)}>
          {p}
        </TextButton>
      )
    ),
    page < end ? (
      <TextButton key="next" onClick={() => setPage(page + 1)}>
        &rsaquo;
      </TextButton>
    ) : null,
    page < totalPages ? (
      <TextButton key="last" onClick={() => setPage(totalPages)}>
        &raquo;
      </TextButton>
    ) : null,
  ]

  return (
    <div>
      {elems
        .filter((elem) => elem != null)
        .flatMap((elem, i) => [elem, <HGap key={`gap${i}`} />])
        .slice(0, -1)}
    </div>
  )
})
