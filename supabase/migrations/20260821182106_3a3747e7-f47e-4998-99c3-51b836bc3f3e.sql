GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE ON TABLE public.ads_settings TO authenticated;
GRANT ALL ON TABLE public.ads_settings TO service_role;

GRANT INSERT ON TABLE public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;