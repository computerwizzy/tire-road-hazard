
-- 1. Drop the existing users table to remove the incorrect schema.
-- CASCADE ensures that any dependent objects like RLS policies are also removed.
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Re-create the users table with the correct schema.
CREATE TABLE public.users (
    -- The id must be a UUID to match the id from auth.users.
    id UUID PRIMARY KEY NOT NULL,
    -- User's email address.
    email TEXT UNIQUE NOT NULL,
    -- User's role for role-based access control.
    role TEXT NOT NULL,
    -- Timestamp for when the user was created.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add a foreign key constraint to enforce the link to the auth.users table.
-- This is crucial for data integrity.
ALTER TABLE public.users
ADD CONSTRAINT fk_auth_users
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE; -- Ensures that if a user is deleted from auth, their record here is also deleted.

-- 4. Re-enable Row Level Security on the new table.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Define the RLS policies for the new users table.

-- Policy: Allows admin users to view all records in the users table.
CREATE POLICY "Allow admins to view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allows any authenticated user to see their own record.
CREATE POLICY "Allow users to view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Note: The application logic now uses the service_role key to bypass RLS for inserts and deletes.
-- These policies are included as a security best practice, providing defense in depth.

-- Policy: Allows admins to insert new users.
CREATE POLICY "Allow admins to add users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allows admins to delete users.
CREATE POLICY "Allow admins to delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
