-- Add the policyDuration column to the policies table
ALTER TABLE public.policies
ADD COLUMN "policyDuration" smallint;
