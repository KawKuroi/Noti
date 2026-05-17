import { requerirUsuario } from '@/lib/auth'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getRecordatorioPorId } from '@/lib/queries/reminder.queries'
import { Temporizador } from '@/components/features/pomodoro/temporizador'

interface Props {
  searchParams: Promise<{ reminderId?: string }>
}

export default async function PaginaPomodoro({ searchParams }: Props) {
  await requerirUsuario()

  const { reminderId } = await searchParams
  const perfil = await getPerfilDelUsuarioActual()

  let tituloReminder: string | undefined
  let reminderIdValido: string | undefined

  if (reminderId) {
    const usuario = await requerirUsuario()
    const recordatorio = await getRecordatorioPorId(usuario.id, reminderId)
    if (recordatorio) {
      tituloReminder = recordatorio.titulo
      reminderIdValido = reminderId
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pomodoro</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tecnica de productividad: 25 min de trabajo, 5 min de descanso.
        </p>
      </div>

      <Temporizador
        sonidoHabilitado={perfil?.sonidoHabilitado ?? true}
        reminderId={reminderIdValido}
        tituloReminder={tituloReminder}
      />
    </div>
  )
}
