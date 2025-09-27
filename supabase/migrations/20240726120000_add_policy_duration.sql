DO $$
BEGIN
   IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'policies' AND column_name = 'policyDuration'
   ) THEN
       ALTER TABLE public.policies
       ADD COLUMN "policyDuration" smallint;
   END IF;
END;
$$;
