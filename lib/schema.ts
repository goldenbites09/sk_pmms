export type Program = {
  id: number
  name: string
  description: string
  date: string
  time: string
  location: string
  budget: number
  status: 'Active' | 'Planning' | 'Completed'
  created_at: string
  updated_at: string
}

export type Participant = {
  id: number
  first_name: string
  last_name: string
  age: number
  contact: string
  email?: string
  address?: string
  created_at: string
  program_participants?: Array<{
    program_id: number
  }>
  program_ids?: number[]
  programs?: string[]
}

export type Expense = {
  id: number
  program_id: number
  description: string
  amount: number
  date: string
  category: string
  notes: string | null
  created_at: string
}

export type User = {
  id: number
  username: string
  email: string
  password_hash: string
  role: 'user' | 'admin' | 'skofficial'
  created_at: string
}

export type ProgramParticipant = {
  id: number
  program_id: number
  participant_id: number
  joined_at: string
}

// SQL to create tables in Supabase
export const createTablesSQL = `
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
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  contact TEXT NOT NULL,
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

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create program_participants table
CREATE TABLE IF NOT EXISTS program_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  program_id BIGINT REFERENCES programs(id) ON DELETE CASCADE,
  participant_id BIGINT REFERENCES participants(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(program_id, participant_id)
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
`