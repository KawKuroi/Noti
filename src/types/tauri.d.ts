// Tipado minimo del puente global de Tauri (withGlobalTauri: true).
// La web carga dentro del webview de la app nativa y llama a los comandos Rust
// via window.__TAURI__.core.invoke; en navegador/mobile este objeto no existe.

export {}

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T>
      }
    }
  }
}
