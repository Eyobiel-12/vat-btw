-- Migration: Seed BTW Codes
-- Description: Inserts default Dutch BTW codes
-- Created: 2024-01-01

-- Insert default Dutch BTW codes
INSERT INTO public.btw_codes (code, description, percentage, rubriek, type) VALUES
  ('1a', 'Leveringen/diensten belast met hoog tarief', 21.00, '1a', 'verschuldigd'),
  ('1b', 'Leveringen/diensten belast met laag tarief', 9.00, '1b', 'verschuldigd'),
  ('1c', 'Leveringen/diensten belast met overige tarieven', 0.00, '1c', 'verschuldigd'),
  ('1d', 'Privégebruik', 21.00, '1d', 'verschuldigd'),
  ('1e', 'Leveringen/diensten belast met 0% of niet bij u belast', 0.00, '1e', 'geen'),
  ('2a', 'Leveringen naar landen buiten de EU', 0.00, '2a', 'geen'),
  ('3a', 'Leveringen naar landen binnen de EU', 0.00, '3a', 'geen'),
  ('3b', 'Diensten naar landen binnen de EU', 0.00, '3b', 'geen'),
  ('4a', 'Leveringen uit landen buiten de EU', 21.00, '4a', 'verlegd'),
  ('4b', 'Leveringen uit landen binnen de EU', 21.00, '4b', 'verlegd'),
  ('5b', 'Voorbelasting', 21.00, '5b', 'voorbelasting'),
  ('5b-laag', 'Voorbelasting laag tarief', 9.00, '5b', 'voorbelasting'),
  ('geen', 'Geen BTW', 0.00, 'geen', 'geen')
ON CONFLICT (code) DO NOTHING;

