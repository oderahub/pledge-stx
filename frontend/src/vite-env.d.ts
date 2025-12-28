/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK: string
  readonly VITE_STACKS_API_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_CONTRACT_NAME: string
  readonly VITE_REOWN_PROJECT_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_ICON: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
