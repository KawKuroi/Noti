import { cache } from 'react'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export const obtenerUsuario = cache(async (): Promise<User | null> => {
  const supabase = await crearClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const requerirUsuario = cache(async (): Promise<User> => {
  const user = await obtenerUsuario()
  if (!user) redirect('/login')
  return user
})
