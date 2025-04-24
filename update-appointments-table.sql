-- Agregar columna para indicar si se pagó la seña
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
