/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAKAMA_SERVER_URL?: string;
  readonly VITE_NAKAMA_SERVER_PORT?: string;
  readonly VITE_NAKAMA_USE_SSL?: string;
  readonly VITE_NAKAMA_SERVER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
