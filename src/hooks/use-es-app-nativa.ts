'use client'

import { useSyncExternalStore } from 'react'

// True cuando la web corre dentro de una app nativa Tauri (escritorio o Android):
// alli existe window.__TAURI__ (withGlobalTauri). En navegador es false.
// useSyncExternalStore lee el valor del cliente con un snapshot de servidor
// estable (false), evitando el mismatch de hidratacion y el warning
// react-hooks/set-state-in-effect de un useEffect + setState.

function suscribir(): () => void {
  // El valor no cambia durante la vida de la pagina: no hay nada que escuchar.
  return () => {}
}

function snapshotCliente(): boolean {
  return typeof window !== 'undefined' && !!window.__TAURI__
}

function snapshotServidor(): boolean {
  return false
}

export function useEsAppNativa(): boolean {
  return useSyncExternalStore(suscribir, snapshotCliente, snapshotServidor)
}
