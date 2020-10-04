import * as B from 'baconjs'
import { h, HarmajaOutput } from 'harmaja'

type Props<T> = {
  component: (props: T) => HarmajaOutput
} & {
  [P in keyof T]: T[P] | B.Property<T[P]>
}

export function Lift<T>(props: Props<T>): HarmajaOutput {
  const { component: Component, ...componentProps } = props
  const TheComponent: any = Component
  const observableKeys: string[] = []
  const observables: any[] = []
  const rest: any = {}
  Object.entries(componentProps).forEach(([k, v]) => {
    if (v instanceof B.Observable) {
      observableKeys.push(k)
      observables.push(v)
    } else {
      rest[k] = v
    }
  })

  const combined = B.combine((...args: any[]) => {
    const result: any = {}
    observableKeys.forEach((key, i) => {
      result[key] = args[i]
    })
    return { ...result }
  }, observables)

  return <TheComponent as any {...combined} {...rest} />
}
