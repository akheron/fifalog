import React from 'react'

import * as styles from './MatchRowButtons.module.css'
import { HGap } from './whitespace'

export interface Props {
  isLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

export default React.memo(function MatchRowButtons({
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.buttons}>
      <button disabled={isLoading} onClick={onEdit}>
        edit
      </button>
      <HGap />
      <button disabled={isLoading} onClick={onDelete}>
        x
      </button>
    </div>
  )
})
