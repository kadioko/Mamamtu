-- PostgreSQL initialization script for MamaMtu
-- This script runs when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add additional ones if needed

-- Example additional indexes (optional)
-- CREATE INDEX IF NOT EXISTS idx_patients_name_search ON patients (last_name, first_name);
-- CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments (start_time, end_time);
-- CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications (user_id, status);

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create a function for updating updated_at timestamp (optional, Prisma handles this)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- Example trigger (optional, Prisma handles this)
-- CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to the mamamtu user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mamamtu;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mamamtu;
