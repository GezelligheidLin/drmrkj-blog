declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, never>
  export default component
}

declare module '*.png' {
  const value: string
  export default value
}
