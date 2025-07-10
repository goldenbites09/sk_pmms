import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ryspfqoxnzdrhrqiiqht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3BmcW94bnpkcmhycWlpcWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTI2NzksImV4cCI6MjA2MzQ4ODY3OX0.tya6y0Fk60uTHxQ5GbXvLJsmiHwqn6JWw9eN2zrQueI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  }
}) 