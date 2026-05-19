'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { crearClienteNavegador } from '@/lib/supabase/client'

export function BotonCerrarSesion() {
  const router = useRouter()
  const supabase = crearClienteNavegador()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={cerrarSesion}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
    >
      <LogOut size={16} />
      Cerrar sesion
    </button>
  )
}
