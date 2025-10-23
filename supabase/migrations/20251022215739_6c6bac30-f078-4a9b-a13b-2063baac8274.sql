-- Add tax_base column to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS tax_base text DEFAULT 'net_profit'::text;