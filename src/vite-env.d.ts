/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vuedraggable' {
  import { DefineComponent } from 'vue'
  const draggable: DefineComponent<any, any, any>
  export default draggable
}

declare module 'nprogress' {
  interface NProgressOptions {
    showSpinner?: boolean
  }

  const NProgress: {
    configure(options: NProgressOptions): void
    start(): void
    done(): void
  }
  export default NProgress
}

