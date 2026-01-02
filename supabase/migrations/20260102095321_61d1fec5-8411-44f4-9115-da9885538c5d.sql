-- Change cassette_count from integer to text to support comma-separated values
ALTER TABLE public.suras_cassette_data
ALTER COLUMN cassette_count TYPE text USING cassette_count::text;