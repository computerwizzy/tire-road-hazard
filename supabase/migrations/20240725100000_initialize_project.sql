
-- 1. Create Tables
-- Create 'users' table
create table if not exists users (
  id serial primary key,
  email text not null unique,
  role text not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create 'policies' table
create table if not exists policies (
  "policyNumber" text primary key,
  "customerName" text not null,
  "customerEmail" text not null,
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
  "isCommercial" boolean default false,
  "tireBrand" text,
  "tireModel" text,
  "tireSize" text,
  "tireQuantity" integer,
  "pricePerTire" numeric,
  "roadHazardPrice" numeric,
  "tireDot1" text,
  "tireDot2" text,
  "tireDot3" text,
  "tireDot4" text,
  "tireDot5" text,
  "tireDot6" text,
  "purchaseDate" date not null,
  "dealerName" text,
  "invoiceNumber" text,
  "warrantyEndDate" date not null,
  "receiptUrl" text,
  "policyDocument" text,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 2. Create Storage Bucket
-- Create 'receipts' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;


-- 3. Row Level Security (RLS) Policies
-- Enable RLS
alter table policies enable row level security;
alter table users enable row level security;

-- Policies for 'policies' table
-- First, drop existing policies if they exist to avoid errors on re-run
drop policy if exists "Authenticated users can do anything on policies" on policies;
drop policy if exists "Enable read access for all users" on policies;

-- Create policies for 'policies' table
create policy "Authenticated users can do anything on policies"
  on policies for all
  using (auth.role() = 'authenticated');

create policy "Enable read access for all users"
  on policies for select
  using (true);

-- Policies for 'users' table
-- First, drop existing policies if they exist
drop policy if exists "Allow admin users to manage users" on users;
drop policy if exists "Allow individual users to view their own data" on users;

-- Create policies for 'users' table
create policy "Allow admin users to manage users"
  on users for all
  using (
    (select role from public.users where email = auth.email()) = 'admin'
  );

create policy "Allow individual users to view their own data"
  on users for select
  using (auth.email() = email);


-- 4. Storage Policies
-- Policies for 'receipts' bucket
-- First, drop existing policies if they exist
drop policy if exists "Allow authenticated users to upload receipts" on storage.objects;
drop policy if exists "Allow public read access to receipts" on storage.objects;

-- Create policies for 'receipts' bucket
create policy "Allow authenticated users to upload receipts"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts');

create policy "Allow public read access to receipts"
  on storage.objects for select
  using (bucket_id = 'receipts');
