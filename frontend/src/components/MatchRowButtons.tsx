import React from 'react'

import * as styles from './MatchRowButtons.scss'

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
    <div className={styles.buttons}>
      {isEditing ? (
        <button disabled={isLoading} onClick={onCancel}>
          cancel
        </button>
      ) : (
        <>
          <button disabled={isLoading} onClick={onEdit}>
            E
          </button>{' '}
          <button disabled={isLoading} onClick={onDelete}>
            R
          </button>
        </>
      )}
    </div>
  )
})
