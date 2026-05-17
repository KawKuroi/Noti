'use client'

import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'
import { crearClienteNavegador } from '@/lib/supabase/client'
import { BusquedaGlobal } from '@/components/features/busqueda-global'

interface Props {
  usuario: User
}

export function Header({ usuario }: Props) {
  const router = useRouter()
  const supabase = crearClienteNavegador()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const iniciales = usuario.user_metadata?.full_name
    ? usuario.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : usuario.email?.[0].toUpperCase() ?? 'U'

  const nombreMostrado = usuario.user_metadata?.full_name ?? usuario.email ?? 'Usuario'

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <BusquedaGlobal />
      <div className="relative group">
        <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
            {iniciales}
          </div>
          <span className="text-sm text-gray-700 font-medium">{nombreMostrado}</span>
        </button>

        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
          <div className="p-1">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border-b border-gray-50">
              <UserIcon size={14} />
              <span className="truncate">{usuario.email}</span>
            </div>
            <button
              onClick={cerrarSesion}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors mt-1"
            >
              <LogOut size={14} />
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
