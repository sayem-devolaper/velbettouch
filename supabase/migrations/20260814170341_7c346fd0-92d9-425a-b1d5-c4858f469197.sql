CREATE TABLE public.ads_settings (
  id text PRIMARY KEY DEFAULT 'default',
  fb_pixel_id text,
  fb_capi_access_token text,
  fb_test_event_code text,
  fb_domain_verification text,
  pixel_enabled boolean NOT NULL DEFAULT true,
  capi_enabled boolean NOT NULL DEFAULT false,
  currency text NOT NULL DEFAULT 'BDT',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ads_settings TO authenticated;
GRANT ALL ON public.ads_settings TO service_role;

ALTER TABLE public.ads_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ads settings" ON public.ads_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert ads settings" ON public.ads_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ads settings" ON public.ads_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.ads_settings (id) VALUES ('default');

ALTER TABLE public.orders ADD COLUMN purchase_tracked boolean NOT NULL DEFAULT false;