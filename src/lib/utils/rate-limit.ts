const ventanas = new Map<string, number[]>()

interface ResultadoLimite {
  ok: boolean
  retryAfter?: number
}

export function verificarLimite(
  clave: string,
  max: number,
  ventanaMs: number,
): ResultadoLimite {
  const ahora = Date.now()
  const inicio = ahora - ventanaMs
  const previas = (ventanas.get(clave) ?? []).filter((t) => t > inicio)

  if (previas.length >= max) {
    const retryAfter = Math.ceil((previas[0] + ventanaMs - ahora) / 1000)
    return { ok: false, retryAfter }
  }

  previas.push(ahora)
  ventanas.set(clave, previas)
  return { ok: true }
}
