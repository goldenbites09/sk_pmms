-- Enable row-level security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policy for creating new participants
CREATE POLICY "Users can create their own participant profile"
  ON participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating participant profiles
CREATE POLICY "Users can update their own participant profile"
  ON participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for reading participant profiles
CREATE POLICY "Users can read their own participant profile"
  ON participants FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for reading public participant information
CREATE POLICY "Admins can read all participant profiles"
  ON participants FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for updating registrations
CREATE POLICY "Users can update their own registrations"
  ON registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.id = registrations.participant_id 
      AND participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.id = registrations.participant_id 
      AND participants.user_id = auth.uid()
    )
  );

-- Policy for creating registrations
CREATE POLICY "Users can create their own registrations"
  ON registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.id = registrations.participant_id 
      AND participants.user_id = auth.uid()
    )
  );
