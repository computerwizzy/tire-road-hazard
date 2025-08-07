
-- Enable Row Level Security if it's not enabled already
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on the 'policies' table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow public read access to policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow authenticated users to create policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow authenticated users to insert policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow owner to update policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow authenticated users to update policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow owner to delete policies" ON "public"."policies";
DROP POLICY IF EXISTS "Allow authenticated users to delete policies" ON "public"."policies";


-- Create new, correct policies for the 'policies' table.

-- 1. Allow any authenticated user to create (insert) new policies.
-- The 'WITH CHECK (true)' is the crucial part that allows the insert operation.
CREATE POLICY "Allow authenticated users to insert policies"
ON public.policies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow any authenticated user to view (select) all policies.
CREATE POLICY "Allow authenticated users to select policies"
ON public.policies
FOR SELECT
TO authenticated
USING (true);

-- 3. Allow any authenticated user to update existing policies.
CREATE POLICY "Allow authenticated users to update policies"
ON public.policies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow any authenticated user to delete policies.
CREATE POLICY "Allow authenticated users to delete policies"
ON public.policies
FOR DELETE
TO authenticated
USING (true);
