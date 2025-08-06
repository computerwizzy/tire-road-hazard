
-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Policies Table
CREATE TABLE IF NOT EXISTS public.policies (
    "policyNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerStreet" TEXT,
    "customerCity" TEXT,
    "customerState" TEXT,
    "customerZip" TEXT,
    "vehicleYear" INTEGER,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleSubmodel" TEXT,
    "vehicleMileage" INTEGER,
    "isCommercial" BOOLEAN,
    "tireBrand" TEXT,
    "tireModel" TEXT,
    "tireSize" TEXT,
    "tireQuantity" INTEGER,
    "pricePerTire" REAL,
    "roadHazardPrice" REAL,
    "tireDot1" TEXT,
    "tireDot2" TEXT,
    "tireDot3" TEXT,
    "tireDot4" TEXT,
    "tireDot5" TEXT,
    "tireDot6" TEXT,
    "purchaseDate" DATE,
    "dealerName" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "warrantyEndDate" DATE,
    "receiptUrl" TEXT,
    "policyDocument" TEXT,
    "tireDot" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY ("policyNumber")
);

-- Create Storage Bucket for Receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;


-- RLS Policies for Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users to view users" ON public.users;
CREATE POLICY "Allow all users to view users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin users to manage users" ON public.users;
CREATE POLICY "Allow admin users to manage users" ON public.users FOR ALL
USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.users WHERE role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM public.users WHERE role = 'admin'));


-- RLS Policies for Policies table
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to manage policies" ON public.policies;
CREATE POLICY "Allow authenticated users to manage policies" ON public.policies FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Storage Policies for Receipts bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload receipts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public read access to receipts" ON storage.objects;
CREATE POLICY "Allow public read access to receipts" ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts');
