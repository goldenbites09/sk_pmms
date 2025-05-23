-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Planning', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    file_urls TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'skofficial', 'viewer')),
    is_approved BOOLEAN DEFAULT false,
    approval_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER,
    contact TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    program_id BIGINT REFERENCES programs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create program_participants table
CREATE TABLE IF NOT EXISTS program_participants (
    program_id BIGINT REFERENCES programs(id) ON DELETE CASCADE,
    participant_id BIGINT REFERENCES participants(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, participant_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for programs table
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON programs;
DROP POLICY IF EXISTS "Enable read access for all users" ON participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON program_participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Create policies for public access (read)
CREATE POLICY "Enable read access for all users" ON programs
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON expenses
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON program_participants
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

-- Create policies for public access (insert)
CREATE POLICY "Enable insert access for all users" ON programs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert access for all users" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert access for all users" ON expenses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert access for all users" ON program_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert access for all users" ON users
    FOR INSERT WITH CHECK (true);

-- Create policies for public access (update)
CREATE POLICY "Enable update access for all users" ON programs
    FOR UPDATE USING (true);

CREATE POLICY "Enable update access for all users" ON participants
    FOR UPDATE USING (true);

CREATE POLICY "Enable update access for all users" ON expenses
    FOR UPDATE USING (true);

CREATE POLICY "Enable update access for all users" ON program_participants
    FOR UPDATE USING (true);

CREATE POLICY "Enable update access for all users" ON users
    FOR UPDATE USING (true);

-- Create policies for public access (delete)
CREATE POLICY "Enable delete access for all users" ON programs
    FOR DELETE USING (true);

CREATE POLICY "Enable delete access for all users" ON participants
    FOR DELETE USING (true);

CREATE POLICY "Enable delete access for all users" ON expenses
    FOR DELETE USING (true);

CREATE POLICY "Enable delete access for all users" ON program_participants
    FOR DELETE USING (true);

CREATE POLICY "Enable delete access for all users" ON users
    FOR DELETE USING (true);

-- Insert sample data into programs table
INSERT INTO programs (name, description, date, time, location, budget, status, file_urls) VALUES
('Community Clean-up', 'A community event to clean up the local park.', '2023-11-01', '09:00-12:00', 'Local Park', 500.00, 'Active', 'http://example.com/file1'),
('Youth Leadership Workshop', 'A workshop for developing leadership skills among youth.', '2023-12-05', '10:00-16:00', 'Community Center', 1000.00, 'Planning', 'http://example.com/file2'),
('Tech Conference', 'A conference for tech enthusiasts.', '2023-11-15', '09:00-17:00', 'Convention Center', 2000.00, 'Active', 'http://example.com/file3'),
('Art Workshop', 'A workshop for budding artists.', '2023-12-10', '11:00-15:00', 'Art Studio', 750.00, 'Planning', 'http://example.com/file4');

-- Insert sample data into participants table
INSERT INTO participants (first_name, last_name, age, contact, email, address) VALUES
('John', 'Doe', 25, '123-456-7890', 'john.doe@example.com', '123 Elm St'),
('Jane', 'Smith', 30, '987-654-3210', 'jane.smith@example.com', '456 Oak St'),
('Alice', 'Brown', 28, '555-123-4567', 'alice.brown@example.com', '789 Pine St'),
('Bob', 'White', 35, '555-765-4321', 'bob.white@example.com', '321 Maple St');

-- Sample data for program_participants table to show multiple program participation
INSERT INTO program_participants (program_id, participant_id) VALUES
(1, 1), -- John Doe in Community Clean-up
(2, 1), -- John Doe in Youth Leadership Workshop
(3, 2), -- Jane Smith in Tech Conference
(4, 2), -- Jane Smith in Art Workshop
(3, 3), -- Alice Brown in Tech Conference
(4, 4); -- Bob White in Art Workshop

-- Insert sample expenses for Community Clean-up (program_id = 1)
INSERT INTO expenses (program_id, description, amount, date, category, notes) VALUES
(1, 'Cleaning supplies', 150.00, '2023-11-01', 'Supplies', 'Includes brooms, garbage bags, and gloves'),
(1, 'Refreshments for volunteers', 100.00, '2023-11-01', 'Food and Beverages', 'Water and snacks for participants'),
(1, 'Safety equipment', 200.00, '2023-10-30', 'Equipment', 'Safety vests and first aid kits');

-- Insert sample expenses for Youth Leadership Workshop (program_id = 2)
INSERT INTO expenses (program_id, description, amount, date, category, notes) VALUES
(2, 'Workshop materials', 300.00, '2023-12-05', 'Supplies', 'Handouts and workbooks'),
(2, 'Speaker honorarium', 400.00, '2023-12-05', 'Professional Fees', 'Payment for guest speaker'),
(2, 'Catering service', 250.00, '2023-12-05', 'Food and Beverages', 'Lunch for participants');

-- Insert sample expenses for Tech Conference (program_id = 3)
INSERT INTO expenses (program_id, description, amount, date, category, notes) VALUES
(3, 'Venue rental', 800.00, '2023-11-15', 'Venue', 'Convention center booking fee'),
(3, 'Audio/Visual equipment', 500.00, '2023-11-15', 'Equipment', 'Projector and sound system rental'),
(3, 'Conference materials', 400.00, '2023-11-14', 'Supplies', 'Badges, programs, and handouts'),
(3, 'Catering', 300.00, '2023-11-15', 'Food and Beverages', 'Coffee breaks and lunch');

-- Insert sample expenses for Art Workshop (program_id = 4)
INSERT INTO expenses (program_id, description, amount, date, category, notes) VALUES
(4, 'Art supplies', 300.00, '2023-12-10', 'Supplies', 'Canvas, paints, and brushes'),
(4, 'Instructor fee', 300.00, '2023-12-10', 'Professional Fees', 'Payment for art instructor'),
(4, 'Refreshments', 100.00, '2023-12-10', 'Food and Beverages', 'Coffee and snacks for break time');