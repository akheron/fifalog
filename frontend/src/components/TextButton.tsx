import classNames from 'classnames'
import React from 'react'

import * as styles from './TextButton.module.css'

export default React.memo(function TextButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={classNames(props.className, styles.textButton)}
    >
      {props.children}
    </button>
  )
})
