
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://uptlnzzhrdvagojsyyhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdGxuenpocmR2YWdvanN5eWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNzg5MjMsImV4cCI6MjA4MTk1NDkyM30.LKoGbwZuEj-SRNryDRY7qpzk4x-z5ohvTDXLfU933d8';

// Check if we have the necessary credentials to connect
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// We export a client only if keys are present to avoid errors.
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null as any;

/*
  EXPECTED DATABASE SCHEMA (Run this in Supabase SQL Editor)

  create table staff (
    id uuid default gen_random_uuid() primary key,
    name text,
    username text unique,
    password text,
    role text
  );

  create table consoles (
    id uuid default gen_random_uuid() primary key,
    name text,
    type text,
    status text
  );

  create table products (
    id uuid default gen_random_uuid() primary key,
    name text,
    price numeric,
    category text,
    stock integer
  );

  create table members (
    id uuid default gen_random_uuid() primary key,
    name text,
    phone text,
    total_rentals integer default 0,
    total_spend numeric default 0,
    active_package jsonb
  );

  create table rentals (
    id uuid default gen_random_uuid() primary key,
    console_id uuid references consoles(id),
    customer_name text,
    member_id uuid references members(id),
    start_time text,
    end_time text,
    is_active boolean,
    items jsonb,
    is_membership_session boolean,
    subtotal_rental numeric,
    subtotal_items numeric,
    discount_amount numeric,
    total_price numeric
  );
  
  create table membership_logs (
    id uuid default gen_random_uuid() primary key,
    member_id uuid references members(id),
    member_name text,
    package_type text,
    amount numeric,
    timestamp text,
    note text
  );

  create table expenses (
    id uuid default gen_random_uuid() primary key,
    note text,
    amount numeric,
    timestamp text,
    staff_id uuid references staff(id),
    staff_name text
  );
  
  -- Insert default admin
  insert into staff (name, username, password, role) values ('Super Admin', 'admin', 'admin123', 'admin');
*/
