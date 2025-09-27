-- Step 1: Drop all known legacy and incorrect policies.
DROP POLICY IF EXISTS "Allow authenticated users to manage their own user record" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.users;
DROP POLICY IF EXISTS "Allow admin users to manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own user record" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to manage all users" ON public.users;

-- Step 2: Ensure RLS is enabled.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create the single, correct policy for managing users.
CREATE POLICY "Allow authenticated users to manage all users"
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
