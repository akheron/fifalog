import { Property } from 'baconjs'
import { h } from 'harmaja'

export type Props = {
  title: string
  disabled: Property<boolean>
  onClick: () => void
}

export default ({ title, disabled, onClick }: Props) => (
  <button type="button" disabled={disabled} onClick={onClick}>
    {title}
  </button>
)
