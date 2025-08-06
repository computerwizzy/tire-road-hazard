
--
-- Create the 'users' table if it doesn't exist
--
CREATE TABLE IF NOT EXISTS public.users (
    id bigint NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure the sequence for the 'id' column exists and is owned by the table
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.users_id_seq OWNER TO postgres;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- Set the default value for 'id' from the sequence if not already set
DO $$
BEGIN
   IF NOT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'id' AND column_default IS NOT NULL
   ) THEN
       ALTER TABLE public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
   END IF;
END $$;


--
-- Create the 'policies' table if it doesn't exist
--
CREATE TABLE IF NOT EXISTS public.policies (
    "policyNumber" text NOT NULL,
    "customerName" text,
    "customerEmail" text,
    "customerPhone" text,
    "tireDot" text,
    "purchaseDate" text,
    "warrantyEndDate" text,
    "receiptUrl" text,
    "policyDocument" text,
    "vehicleYear" integer,
    "vehicleMake" text,
    "vehicleModel" text,
    "vehicleMileage" integer,
    "dealerName" text,
    "invoiceNumber" text,
    "roadHazardPrice" real,
    "pricePerTire" real,
    "tireQuantity" integer,
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
    "tireSize" text
);


--
-- Add Primary Keys only if they don't exist
--
DO $$
BEGIN
   IF NOT EXISTS (
       SELECT 1
       FROM information_schema.table_constraints
       WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
   ) THEN
       ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
   END IF;
END $$;

DO $$
BEGIN
   IF NOT EXISTS (
       SELECT 1
       FROM information_schema.table_constraints
       WHERE table_name = 'policies' AND constraint_type = 'PRIMARY KEY'
   ) THEN
       ALTER TABLE public.policies ADD CONSTRAINT policies_pkey PRIMARY KEY ("policyNumber");
   END IF;
END $$;


--
-- Enable Row Level Security (RLS) on both tables
--
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

--
-- Create RLS policies for the 'users' and 'policies' tables
-- These policies allow authenticated users to view all data.
--
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
CREATE POLICY "Allow authenticated users to read users" ON public.users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read policies" ON public.policies;
CREATE POLICY "Allow authenticated users to read policies" ON public.policies FOR SELECT TO authenticated USING (true);


--
-- Create the 'receipts' bucket in Supabase Storage if it doesn't exist
--
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

--
-- Create storage policies for the 'receipts' bucket
-- Policy 1: Allow authenticated users to upload files (INSERT)
--
DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload receipts"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'receipts');

--
-- Policy 2: Allow anyone to view files (SELECT)
-- This is necessary so the application can display the receipt images.
--
DROP POLICY IF EXISTS "Allow public read access to receipts" ON storage.objects;
CREATE POLICY "Allow public read access to receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts');
