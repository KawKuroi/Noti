const FONDO = '#0f0f11'
const FONDO_CARD = '#1a1a1e'
const BORDE = '#2a2a30'
const TINTA = '#f0f0f0'
const TINTA_3 = '#888888'
const ACENTO = '#7c6af7'

function baseHtml(titulo: string, contenido: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:${FONDO};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TINTA};">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:26px;font-weight:700;color:${TINTA};letter-spacing:-0.5px;">Noti</span>
    </div>
    <div style="background:${FONDO_CARD};border:1px solid ${BORDE};border-radius:14px;padding:32px;">
      ${contenido}
    </div>
    <p style="text-align:center;font-size:12px;color:${TINTA_3};margin-top:24px;line-height:1.5;">
      Este correo fue generado automaticamente por Noti. No respondas a este mensaje.
    </p>
  </div>
</body>
</html>`
}

export function plantillaRecuperacionCuenta({
  nombreMostrado,
  urlRecuperacion,
}: {
  nombreMostrado: string | null
  urlRecuperacion: string
}): string {
  const nombre = nombreMostrado ?? 'usuario'
  return baseHtml(
    'Recupera tu cuenta de Noti',
    `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${TINTA};">Tu cuenta fue eliminada</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${TINTA_3};line-height:1.6;">
      Hola ${nombre}, solicitaste eliminar tu cuenta de Noti.
      Tienes <strong style="color:${TINTA};">30 dias</strong> para recuperarla antes de que se borre definitivamente junto con todos tus datos.
    </p>
    <a href="${urlRecuperacion}"
       style="display:inline-block;background:${ACENTO};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
      Recuperar mi cuenta
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:${TINTA_3};line-height:1.6;">
      Si no fuiste tu, ignora este correo. Si el boton no funciona, copia este enlace en tu navegador:<br/>
      <span style="color:${ACENTO};word-break:break-all;font-size:12px;">${urlRecuperacion}</span>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:${TINTA_3};">
      Este enlace expira en 30 dias.
    </p>`,
  )
}

export function plantillaRecuperacionRecordatorios({
  nombreMostrado,
  nombresCategorias,
  urlRecuperacion,
}: {
  nombreMostrado: string | null
  nombresCategorias: string[]
  urlRecuperacion: string
}): string {
  const nombre = nombreMostrado ?? 'usuario'
  const listaCategorias =
    nombresCategorias.length > 0
      ? `<ul style="margin:8px 0 16px;padding-left:20px;color:${TINTA_3};font-size:14px;line-height:1.8;">
          ${nombresCategorias.map((c) => `<li>${c}</li>`).join('')}
        </ul>`
      : `<p style="margin:8px 0 16px;color:${TINTA_3};font-size:14px;">Todos los recordatorios</p>`

  return baseHtml(
    'Recupera tus recordatorios de Noti',
    `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${TINTA};">Tus recordatorios fueron eliminados</h1>
    <p style="margin:0 0 12px;font-size:14px;color:${TINTA_3};line-height:1.6;">
      Hola ${nombre}, eliminaste los recordatorios de las siguientes categorias:
    </p>
    ${listaCategorias}
    <p style="margin:0 0 24px;font-size:14px;color:${TINTA_3};line-height:1.6;">
      Tienes <strong style="color:${TINTA};">30 dias</strong> para recuperarlos.
    </p>
    <a href="${urlRecuperacion}"
       style="display:inline-block;background:${ACENTO};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
      Recuperar mis recordatorios
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:${TINTA_3};line-height:1.6;">
      Si no fuiste tu, ignora este correo. Si el boton no funciona:<br/>
      <span style="color:${ACENTO};word-break:break-all;font-size:12px;">${urlRecuperacion}</span>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:${TINTA_3};">
      Este enlace expira en 30 dias.
    </p>`,
  )
}
