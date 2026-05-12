import { Bell } from 'lucide-react'

export default function PaginaDashboard() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proximos recordatorios</h1>
        <p className="text-sm text-gray-500 mt-1">Todo lo que tienes pendiente</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Crea tu primer recordatorio
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mb-6">
          Organiza peliculas, tareas, clases, cumpleanos y eventos en un solo lugar.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-40 cursor-not-allowed"
          title="Disponible en la proxima fase"
        >
          Nuevo recordatorio
        </button>
      </div>
    </div>
  )
}
