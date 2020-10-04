import { Atom, h } from 'harmaja'

const Input = (props: { type?: 'text' | 'password'; value: Atom<string> }) => (
  <input
    type={props.type ?? 'text'}
    value={props.value}
    onInput={e => {
      props.value.set(e.target.value)
    }}
  />
)

export default Input
