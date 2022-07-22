import React from 'react'

import { HGap } from './whitespace'

export interface Props {
  isLoading: boolean
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
}

export default React.memo(function MatchRowButtons({
  isLoading,
  isEditing,
  onEdit,
  onDelete,
  onCancel,
}: Props) {
  return (
    <div>
      {isEditing ? (
        <button disabled={isLoading} onClick={onCancel}>
          cancel
        </button>
      ) : (
        <>
          <button disabled={isLoading} onClick={onEdit}>
            E
          </button>
          <HGap />
          <button disabled={isLoading} onClick={onDelete}>
            R
          </button>
        </>
      )}
    </div>
  )
})
