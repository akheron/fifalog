import React, { useCallback } from 'react'

export interface Option {
  id: number
  name: string
}

export type Props = {
  options: Option[]
  value: number
  onChange: (value: number) => void
}

export default React.memo(function Select({ options, value, onChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange]
  )

  return (
    <select onChange={handleChange} value={value.toString()}>
      {options.map(({ id, name }) => (
        <option key={id} value={id.toString()}>
          {name}
        </option>
      ))}
    </select>
  )
})
