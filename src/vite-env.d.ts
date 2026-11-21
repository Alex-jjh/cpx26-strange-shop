interface ImportMetaEnv {
  /** Base URL of the deployed API. Empty on the web (same origin); set for the Capacitor APK. */
  readonly VITE_API_BASE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
