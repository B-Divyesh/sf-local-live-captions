/// <reference types="vite/client" />

declare const __DESKTOP__: boolean;

interface Window {
  __TAURI_INTERNALS__?: unknown;
  __LLC_INVOKE__?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
}
