-- Add retoucher payment fields to deals table
-- Поля для оплаты ретушеру
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS retoucher_payment_type TEXT DEFAULT 'percent' CHECK (retoucher_payment_type IN ('percent', 'fixed')),
ADD COLUMN IF NOT EXISTS retoucher_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS retoucher_fixed NUMERIC DEFAULT 0;

-- Add layout payment fields to deals table  
-- Поля для оплаты верстальщику
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS layout_payment_type TEXT DEFAULT 'percent' CHECK (layout_payment_type IN ('percent', 'fixed')),
ADD COLUMN IF NOT EXISTS layout_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS layout_fixed NUMERIC DEFAULT 0;
