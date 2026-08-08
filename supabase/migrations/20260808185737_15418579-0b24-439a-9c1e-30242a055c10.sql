CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_area TEXT NOT NULL CHECK (delivery_area IN ('inside_dhaka','outside_dhaka')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 50),
  unit_price INTEGER NOT NULL DEFAULT 690,
  delivery_charge INTEGER NOT NULL DEFAULT 60,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  utm_id TEXT,
  fbclid TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an order"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);