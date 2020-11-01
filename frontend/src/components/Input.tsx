import { Atom, h } from 'harmaja/bacon'

export type Props = { type?: 'text' | 'password'; value: Atom<string> }

export default ({ type = 'text', value }: Props) => (
  <input
    type={type}
    value={value}
    onInput={e => {
      value.set(e.target.value)
    }}
  />
)
