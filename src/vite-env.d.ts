/// <reference types="vite/client" />

declare const __DESKTOP__: boolean;
declare const __APP_VERSION__: string;
declare const __BUILD_SHA__: string;

interface Window {
  __TAURI_INTERNALS__?: unknown;
  __LLC_INVOKE__?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
}
