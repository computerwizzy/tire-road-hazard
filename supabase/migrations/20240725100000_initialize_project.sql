
-- Create Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "policyNumber" text UNIQUE NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text,
    "customerStreet" text,
    "customerCity" text,
    "customerState" text,
    "customerZip" text,
    "vehicleYear" integer,
    "vehicleMake" text,
    "vehicleModel" text,
    "vehicleSubmodel" text,
    "vehicleMileage" integer,
    "isCommercial" boolean DEFAULT false,
    "tireBrand" text,
    "tireModel" text,
    "tireSize" text,
    "tireQuantity" integer,
    "pricePerTire" real,
    "roadHazardPrice" real,
    "tireDot1" text,
    "tireDot2" text,
    "tireDot3" text,
    "tireDot4" text,
    "tireDot5" text,
    "tireDot6" text,
    "purchaseDate" date NOT NULL,
    "dealerName" text,
    "invoiceNumber" text,
    "warrantyEndDate" date NOT NULL,
    "receiptUrl" text,
    "policyDocument" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email text UNIQUE NOT NULL,
    role text CHECK (role IN ('admin', 'member')) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert a default admin user if it doesn't exist
INSERT INTO users (email, role)
VALUES ('admin@tupctech.com', 'admin')
ON CONFLICT (email) DO NOTHING;


-- Enable Row Level Security (RLS)
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'policies' table
DROP POLICY IF EXISTS "Allow public read access to policies" ON policies;
CREATE POLICY "Allow public read access to policies" ON policies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to policies" ON policies;
CREATE POLICY "Allow admin full access to policies" ON policies
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for 'users' table
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;
CREATE POLICY "Allow admin full access to users" ON users
    FOR ALL USING (auth.role() = 'authenticated');

-- Create Storage Bucket for Receipts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'receipts' bucket
DROP POLICY IF EXISTS "Allow public read access to receipts" ON storage.objects;
CREATE POLICY "Allow public read access to receipts" ON storage.objects
    FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow authenticated users to upload receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
    
DROP POLICY IF EXISTS "Allow authenticated users to update receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to update receipts" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete receipts" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete receipts" ON storage.objects
    FOR DELETE USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

