-- Habilitar RLS en todas las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Categorias: lectura publica para todos (anon + authenticated)
CREATE POLICY "categorias_lectura_publica" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

-- Perfiles: cada usuario solo ve y modifica el suyo
CREATE POLICY "perfil_propio_select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "perfil_propio_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "perfil_propio_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Recordatorios: cada usuario solo ve y modifica los suyos
CREATE POLICY "recordatorios_propios_select" ON public.reminders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "recordatorios_propios_insert" ON public.reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recordatorios_propios_update" ON public.reminders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recordatorios_propios_delete" ON public.reminders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Suscripciones push: cada usuario solo ve y modifica las suyas
CREATE POLICY "suscripciones_propias_select" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "suscripciones_propias_insert" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suscripciones_propias_delete" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Log de notificaciones: cada usuario solo ve el suyo
-- El cron escribe via service role (bypassa RLS automaticamente)
CREATE POLICY "logs_propios_select" ON public.notification_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
