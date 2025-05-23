-- Script to ensure the registrations table exists with proper constraints

-- First, check if registrations table exists, if not create it
CREATE TABLE IF NOT EXISTS registrations (
    program_id BIGINT REFERENCES programs(id) ON DELETE CASCADE,
    participant_id BIGINT REFERENCES participants(id) ON DELETE CASCADE,
    registration_status TEXT NOT NULL CHECK (registration_status IN ('Approved', 'Pending', 'Waitlisted', 'Rejected')),
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (program_id, participant_id)
);

-- Create updated_at trigger for registrations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registrations_updated_at') THEN
        CREATE TRIGGER update_registrations_updated_at
            BEFORE UPDATE ON registrations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security for registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for the registrations table
DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable insert access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable update access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable delete access for all users" ON registrations;

CREATE POLICY "Enable read access for all users" ON registrations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON registrations
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON registrations
    FOR DELETE USING (true);

-- Migrate any existing program_participants entries to registrations if they don't exist already
INSERT INTO registrations (program_id, participant_id, registration_status, registration_date, updated_at)
SELECT 
    pp.program_id, 
    pp.participant_id, 
    'Approved' AS registration_status, 
    NOW() AS registration_date,
    NOW() AS updated_at
FROM 
    program_participants pp
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM registrations r 
        WHERE r.program_id = pp.program_id AND r.participant_id = pp.participant_id
    );
