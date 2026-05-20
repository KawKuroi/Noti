// Parser determinista de fechas naturales en espanol. Devuelve YYYY-MM-DD o null.
// No usa date-fns para evitar interferencias de zona horaria: opera con Date local
// del usuario y se queda dentro del calendario civil (dia/mes), sumando 1 ano si la
// fecha resultante es estrictamente anterior a `hoy` (regla de Fase 18).
// Cubre formatos: dd/mm, dd-mm, dd mmm, dd de mmmm, mmm dd, mmmm dd.

const MESES: Record<string, number> = {
  ene: 0, enero: 0,
  feb: 1, febrero: 1,
  mar: 2, marzo: 2,
  abr: 3, abril: 3,
  may: 4, mayo: 4,
  jun: 5, junio: 5,
  jul: 6, julio: 6,
  ago: 7, agosto: 7,
  sep: 8, set: 8, septiembre: 8, setiembre: 8,
  oct: 9, octubre: 9,
  nov: 10, noviembre: 10,
  dic: 11, diciembre: 11,
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function obtenerMes(nombre: string): number | null {
  const clave = nombre.length >= 3 ? nombre.slice(0, 3) : nombre
  if (clave in MESES) return MESES[clave]
  return nombre in MESES ? MESES[nombre] : null
}

function fechaValida(dia: number, mes: number): boolean {
  if (mes < 0 || mes > 11) return false
  if (dia < 1 || dia > 31) return false
  const diasPorMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return dia <= diasPorMes[mes]
}

function formatear(fecha: Date): string {
  const ano = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function ajustarAno(dia: number, mes: number, hoy: Date): string {
  const candidato = new Date(hoy.getFullYear(), mes, dia)
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  if (candidato < hoySinHora) {
    candidato.setFullYear(candidato.getFullYear() + 1)
  }
  return formatear(candidato)
}

export function parsearFechaNatural(texto: string, hoy: Date): string | null {
  const normalizado = normalizar(texto)

  const matchNumerico = normalizado.match(/(?<![\d])(\d{1,2})[\/\-](\d{1,2})(?![\d])/)
  if (matchNumerico) {
    const dia = Number(matchNumerico[1])
    const mes = Number(matchNumerico[2]) - 1
    if (fechaValida(dia, mes)) return ajustarAno(dia, mes, hoy)
  }

  const matchDiaMes = normalizado.match(/(?<![\d])(\d{1,2})\s+(?:de\s+)?([a-z]{3,12})(?:\s+de\s+\d{4})?/)
  if (matchDiaMes) {
    const dia = Number(matchDiaMes[1])
    const mes = obtenerMes(matchDiaMes[2])
    if (mes !== null && fechaValida(dia, mes)) return ajustarAno(dia, mes, hoy)
  }

  const matchMesDia = normalizado.match(/(?<![a-z])([a-z]{3,12})\s+(\d{1,2})(?![\d])/)
  if (matchMesDia) {
    const mes = obtenerMes(matchMesDia[1])
    const dia = Number(matchMesDia[2])
    if (mes !== null && fechaValida(dia, mes)) return ajustarAno(dia, mes, hoy)
  }

  return null
}
