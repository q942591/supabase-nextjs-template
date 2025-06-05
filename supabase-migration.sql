-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY,
  key TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polar_customers table
CREATE TABLE IF NOT EXISTS polar_customers (
  id UUID PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polar_subscriptions table
CREATE TABLE IF NOT EXISTS polar_subscriptions (
  id UUID PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads ("userId");
CREATE INDEX IF NOT EXISTS polar_customers_user_id_idx ON polar_customers ("userId");
CREATE INDEX IF NOT EXISTS polar_subscriptions_user_id_idx ON polar_subscriptions ("userId");
CREATE INDEX IF NOT EXISTS polar_subscriptions_subscription_id_idx ON polar_subscriptions ("subscriptionId");

-- Create storage bucket for uploads
-- Note: This needs to be executed in Supabase dashboard or using Supabase CLI
-- CREATE STORAGE BUCKET uploads;

-- Set up RLS (Row Level Security) policies
-- For uploads table
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own uploads"
  ON uploads FOR UPDATE
  USING (auth.uid() = "userId");

CREATE POLICY "Users can delete their own uploads"
  ON uploads FOR DELETE
  USING (auth.uid() = "userId");

-- For polar_customers table
ALTER TABLE polar_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
  ON polar_customers FOR SELECT
  USING (auth.uid() = "userId");

-- For polar_subscriptions table
ALTER TABLE polar_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON polar_subscriptions FOR SELECT
  USING (auth.uid() = "userId");