-- Add is_exported column to suras_cassette_data table
ALTER TABLE public.suras_cassette_data 
ADD COLUMN is_exported boolean NOT NULL DEFAULT false;