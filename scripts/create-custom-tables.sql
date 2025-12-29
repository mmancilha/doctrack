-- Create custom_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_categories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create custom_clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_clients (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

