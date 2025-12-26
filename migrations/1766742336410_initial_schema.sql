CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'Client' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  contact_person text,
  contact_number text NOT NULL,
  email_address text NOT NULL UNIQUE,
  industry_type text,
  registration_date date NOT NULL,
  customer_status text DEFAULT 'Active' NOT NULL,
  address_line text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers (customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email_address);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (customer_status);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers (created_by);

CREATE TABLE IF NOT EXISTS cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  case_id text NOT NULL UNIQUE,
  case_title text NOT NULL,
  client_id uuid NOT NULL,
  case_type text NOT NULL,
  case_status text DEFAULT 'New' NOT NULL,
  assigned_attorney uuid NOT NULL,
  filing_date date NOT NULL,
  court_name text,
  hearing_date date,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON cases (case_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases (client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (case_status);
CREATE INDEX IF NOT EXISTS idx_cases_attorney ON cases (assigned_attorney);
CREATE INDEX IF NOT EXISTS idx_cases_hearing_date ON cases (hearing_date);

CREATE TABLE IF NOT EXISTS client_engagements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  engagement_id text NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  engagement_type text NOT NULL,
  engagement_date date NOT NULL,
  engagement_outcome text NOT NULL,
  contact_person text,
  recorded_by uuid NOT NULL,
  engagement_channel text NOT NULL,
  engagement_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_engagements_engagement_id ON client_engagements (engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagements_client_id ON client_engagements (client_id);
CREATE INDEX IF NOT EXISTS idx_engagements_type ON client_engagements (engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_date ON client_engagements (engagement_date);
CREATE INDEX IF NOT EXISTS idx_engagements_recorded_by ON client_engagements (recorded_by);

CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents (uploaded_by);