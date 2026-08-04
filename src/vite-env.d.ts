/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EPI_API_URL?: string;
  readonly VITE_EPI_API_TIMEOUT_MS?: string;
  readonly VITE_TERMINAL_RESET_SECONDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
