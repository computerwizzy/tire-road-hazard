
-- Create the users table to store admin panel users
CREATE TABLE IF NOT EXISTS public.users (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email text UNIQUE,
    role text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the policies table to store warranty information
CREATE TABLE IF NOT EXISTS public.policies (
    "policyNumber" text NOT NULL,
    "customerName" text,
    "customerEmail" text,
    "customerPhone" text,
    "tireDot" text,
    "purchaseDate" date,
    "warrantyEndDate" date,
    "receiptUrl" text,
    "policyDocument" text,
    "vehicleYear" real,
    "vehicleMake" text,
    "vehicleModel" text,
    "vehicleMileage" real,
    "dealerName" text,
    "invoiceNumber" text,
    "roadHazardPrice" real,
    "pricePerTire" real,
    "tireQuantity" real,
    "tireDot1" text,
    "tireDot2" text,
    "tireDot3" text,
    "tireDot4" text,
    "tireDot5" text,
    "tireDot6" text,
    "customerStreet" text,
    "customerCity" text,
    "customerState" text,
    "customerZip" text,
    "vehicleSubmodel" text,
    "isCommercial" boolean,
    "tireBrand" text,
    "tireModel" text,
    "tireSize" text,
    CONSTRAINT policies_pkey PRIMARY KEY ("policyNumber")
);


-- Secure the tables with Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Allow admin users to manage all users
DROP POLICY IF EXISTS "Allow admin users to manage all users" ON public.users;
CREATE POLICY "Allow admin users to manage all users" ON public.users
FOR ALL
TO authenticated
USING (auth.uid() IN ( SELECT id FROM public.users WHERE role = 'admin' ));

-- Allow authenticated users to view all users (or based on your app's logic)
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON public.users;
CREATE POLICY "Allow authenticated users to view users" ON public.users
FOR SELECT
TO authenticated
USING (true);


-- Allow admin users to manage all policies
DROP POLICY IF EXISTS "Allow admin to manage all policies" ON public.policies;
CREATE POLICY "Allow admin to manage all policies" ON public.policies
FOR ALL
TO authenticated
USING (auth.uid() IN ( SELECT id FROM public.users WHERE role = 'admin' ))
WITH CHECK (auth.uid() IN ( SELECT id FROM public.users WHERE role = 'admin' ));


-- Allow public read-only access for searching
DROP POLICY IF EXISTS "Allow public read-only access" ON public.policies;
CREATE POLICY "Allow public read-only access" ON public.policies
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert a new policy (for the main registration form)
DROP POLICY IF EXISTS "Allow public insert" ON public.policies;
CREATE POLICY "Allow public insert" ON public.policies
FOR INSERT
TO public
WITH CHECK (true);


-- Create the 'receipts' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to receipts
DROP POLICY IF EXISTS "Allow public read access to receipts" ON storage.objects;
CREATE POLICY "Allow public read access to receipts" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- Allow authenticated users to upload receipts
DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload receipts" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');
