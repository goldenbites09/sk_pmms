import { supabase } from './supabase'

export async function fetchData(table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
  
  if (error) throw error
  return data
}

export async function insertData(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
  
  if (error) throw error
  return result
}

export async function updateData(table: string, id: number, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return result
}

export async function deleteData(table: string, id: number) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Programs
export async function getPrograms() {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, description, date, time, location, budget, status, file_urls, created_at, updated_at")
  if (error) throw error
  return data
}

export async function getProgram(id: number) {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, description, date, time, location, budget, status, file_urls, created_at, updated_at")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function createProgram(program: any) {
  try {
    const { data, error } = await supabase
      .from("programs")
      .insert({
        name: program.name,
        description: program.description,
        date: program.date,
        time: program.time,
        location: program.location,
        budget: program.budget,
        status: program.status,
        file_urls: program.file_urls || '',
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating program:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createProgram:", error)
    throw error
  }
}

export async function updateProgram(id: number, program: any) {
  const { data, error } = await supabase.from("programs").update(program).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteProgram(id: number) {
  const { error } = await supabase.from("programs").delete().eq("id", id)
  if (error) throw error
}

// Participants
export async function getParticipants() {
  try {
    const { data: participants, error } = await supabase
    .from("participants")
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        age,
        contact,
        email,
        address,
        created_at,
        registrations (
          program_id,
          registration_status
        )
      `)
    
    if (error) {
      console.error("Error fetching participants:", error)
      throw error
    }

    if (!participants) {
      return []
    }

    // Transform the data to include program_ids array
    const transformedParticipants = participants.map(participant => ({
      ...participant,
      program_ids: participant.registrations?.map((reg: any) => reg.program_id) || []
    }))

    return transformedParticipants
  } catch (error) {
    console.error("Error in getParticipants:", error)
    return [] // Return empty array instead of throwing error
  }
}

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string | null;
  address: string;
  user_id?: string | null;
  program_ids?: number[];
  created_at?: string;
  registration_status?: string;
  registration_date?: string;
  updated_at?: string;
  programs?: Array<{
    id: number;
    name: string;
    date: string;
    location: string;
  }>;
}

interface ParticipantProgram {
  id?: number;
  name?: string;
  date?: string;
  location?: string;
  registration_date: string;
  registration_status: string;
}

interface ParticipantData {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string | null;
  address: string;
  user_id?: string | null;
  created_at?: string;
}

interface RegistrationData {
  registration_status: string;
  registration_date: string;
  updated_at: string;
  participant: ParticipantData;
}

export interface Registration {
  registration_status: string;
  registration_date: string;
  participant: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    contact: string;
    email?: string;
    address?: string;
    created_at: string;
    programs?: Array<{
      program: {
        id: number;
        name: string;
        date: string;
        location: string;
      };
      registration_date: string;
      registration_status: string;
    }>;
  };
}

interface RegistrationWithParticipant {
  registration_status: string;
  registration_date: string;
  updated_at: string;
  participants: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    contact: string;
    email?: string;
    address?: string;
    created_at: string;
  };
}

interface DatabaseParticipant {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string;
  address?: string;
  created_at: string;
}

interface DatabaseRegistration {
  registration_status: string;
  registration_date: string;
  updated_at: string;
  participants: DatabaseParticipant;
}

export async function getParticipantsByProgram(programId: number): Promise<Participant[]> {
  try {
    console.log('Fetching participants for program:', programId);
    
    const { data, error: registrationsError } = await supabase
      .from('registrations')
      .select(`
        registration_status,
        registration_date,
        updated_at,
        participants!inner (
          id,
          first_name,
          last_name,
          age,
          contact,
          email,
          address,
          created_at
        )
      `)
      .eq('program_id', programId)
      .order('registration_date', { ascending: false });

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError);
      throw registrationsError;
    }

    console.log('Raw registrations data:', data);

    if (!data || !Array.isArray(data)) return [];

    // Transform the data to match the Participant interface
    const participants = (data as unknown as DatabaseRegistration[])
      .filter(reg => reg.participants && typeof reg.participants === 'object')
      .map(reg => ({
        id: reg.participants.id,
        first_name: reg.participants.first_name,
        last_name: reg.participants.last_name,
        age: reg.participants.age,
        contact: reg.participants.contact,
        email: reg.participants.email || null,
        address: reg.participants.address || '',
        created_at: reg.participants.created_at,
        registration_status: reg.registration_status,
        registration_date: reg.registration_date,
        updated_at: reg.updated_at,
        programs: []
      } as Participant));

    console.log('Transformed participants data:', participants);
    return participants;
  } catch (error) {
    console.error('Error in getParticipantsByProgram:', error);
    throw error;
  }
}

export async function getParticipant(id: number) {
  try {
    console.log('Fetching participant with ID:', id);
    
    // First, get the basic participant data
    const { data: participant, error } = await supabase
      .from("participants")
      .select('*')
      .eq("id", id)
      .single();

    if (error) {
      console.error('Error fetching participant:', error);
      return null;
    }

    if (!participant) {
      console.error('Participant not found');
      return null;
    }
    
    // Get program enrollments from both tables for complete coverage
    const [programParticipantsResult, registrationsResult, programsResult] = await Promise.all([
      // Get from program_participants table
      supabase
        .from("program_participants")
        .select('program_id')
        .eq("participant_id", id),
        
      // Get from registrations table
      supabase
        .from("registrations")
        .select('program_id, registration_status')
        .eq("participant_id", id),
        
      // Get all programs for reference
      supabase
        .from("programs")
        .select("id, name")
    ]);
    
    // Combine program IDs from both sources to ensure complete coverage
    const programParticipants = programParticipantsResult.data || [];
    const registrations = registrationsResult.data || [];
    const allPrograms = programsResult.data || [];
    
    // Get unique program IDs from both tables
    const programIdsFromParticipants = programParticipants.map((pp: any) => pp.program_id);
    const programIdsFromRegistrations = registrations.map((reg: any) => reg.program_id);
    
    // Combine and deduplicate
    const allProgramIds = [...new Set([...programIdsFromParticipants, ...programIdsFromRegistrations])].filter(Boolean);
    
    console.log('All program IDs for participant:', allProgramIds);
    
    // Create registration status map
    const registrationMap = registrations.reduce((map: any, reg: any) => {
      if (reg && reg.program_id) {
        map[reg.program_id] = reg.registration_status;
      }
      return map;
    }, {});
    
    // Filter programs to only include the ones the participant is enrolled in
    const enrolledPrograms = allPrograms.filter((p: any) => allProgramIds.includes(p.id));
    console.log('Enrolled programs:', enrolledPrograms);
    
    return {
      ...participant,
      program_ids: allProgramIds,
      programs: enrolledPrograms.map((p: any) => p.name),
      programsData: enrolledPrograms,
      registrationStatuses: registrationMap
    };
  } catch (error) {
    console.error('Error in getParticipant:', error);
    return null;
  }
}

interface ParticipantInput {
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string | null;
  address: string;
  user_id?: string | null;
  program_ids?: number[];
}

export async function createParticipant(participant: ParticipantInput) {
  try {
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'age', 'contact', 'address'] as const;
    const missingFields = requiredFields.filter(field => !participant[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate age is a positive number
    if (isNaN(participant.age) || participant.age < 0) {
      throw new Error('Age must be a positive number');
    }

    // First check if participant with same name and contact exists
    const { data: existingParticipant, error: checkError } = await supabase
      .from("participants")
      .select("*")
      .match({ 
        first_name: participant.first_name,
        last_name: participant.last_name,
        contact: participant.contact 
      })
      .maybeSingle();

    if (checkError) {
      throw new Error(`Error checking existing participant: ${checkError.message}`);
    }

    if (existingParticipant) {
      throw new Error('A participant with the same name and contact already exists');
    }

    // Start a transaction-like sequence
    let newParticipant: ParticipantData | null = null;

    try {
      // 1. Create the participant
      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .insert({
          first_name: participant.first_name,
          last_name: participant.last_name,
          age: participant.age,
          contact: participant.contact,
          email: participant.email || null,
          address: participant.address,
          user_id: participant.user_id || null
        })
        .select()
        .single();

      if (participantError) {
        throw new Error(`Error creating participant: ${participantError.message}`);
      }

      if (!participantData) {
        throw new Error('Failed to create participant: No data returned');
      }

      newParticipant = participantData;

      // 2. If program_ids are provided, create registrations
      if (participant.program_ids && Array.isArray(participant.program_ids) && participant.program_ids.length > 0) {
        if (!newParticipant) {
          throw new Error('Participant data is missing');
        }

        const currentDate = new Date().toISOString();
        const participantId = newParticipant.id;
        
        // Create all registrations in a single batch
        const registrationInserts = participant.program_ids.map((programId: number) => ({
          program_id: programId,
          participant_id: participantId,
          registration_status: 'Approved',
          registration_date: currentDate,
          updated_at: currentDate
        }));

        const { error: regError } = await supabase
          .from('registrations')
          .insert(registrationInserts);

        if (regError) {
          throw new Error(`Error creating registrations: ${regError.message}`);
        }
      }

      // 3. Fetch the complete participant data with their programs
      if (!newParticipant) {
        throw new Error('Participant data is missing');
      }

      const { data: completeParticipant, error: fetchError } = await supabase
        .from('participants')
        .select(`
          *,
          registrations (
            program_id,
            registration_status,
            registration_date,
            programs (
              id,
              name,
              date,
              location
            )
          )
        `)
        .eq('id', newParticipant.id)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching complete participant data: ${fetchError.message}`);
      }

      return completeParticipant;

    } catch (error: any) {
      // If anything fails, clean up the participant
      if (newParticipant) {
        await supabase
          .from('participants')
          .delete()
          .eq('id', newParticipant.id);
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in createParticipant:", error.message);
    throw error;
  }
}

export async function updateParticipant(id: number, participant: any) {
  try {
    // Update participant basic information
    const { data: updatedParticipant, error: updateError } = await supabase
      .from("participants")
      .update({
        first_name: participant.first_name,
        last_name: participant.last_name,
        age: parseInt(participant.age),
        contact: participant.contact,
        email: participant.email || null,
        address: participant.address
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating participant:", updateError)
      throw updateError
    }

    // If program_ids are provided, update program registrations
    if (participant.program_ids && Array.isArray(participant.program_ids)) {
      // First, get current registrations
      const { data: currentRegistrations, error: fetchError } = await supabase
        .from("registrations")
        .select('program_id, registration_status')
        .eq("participant_id", id);

      if (fetchError) {
        console.error("Error fetching current registrations:", fetchError)
        throw fetchError
      }

      // Determine programs to add and remove
      const currentProgramIds = currentRegistrations?.map(reg => reg.program_id) || [];
      const programIdsToAdd = participant.program_ids.filter((pid: number) => !currentProgramIds.includes(pid));
      const programIdsToRemove = currentProgramIds.filter(pid => !participant.program_ids.includes(pid));

      console.log("Current program IDs:", currentProgramIds);
      console.log("Program IDs to add:", programIdsToAdd);
      console.log("Program IDs to remove:", programIdsToRemove);

      // Remove registrations that are no longer needed
      if (programIdsToRemove.length > 0) {
        // Remove each one individually to avoid transaction errors
        for (const programId of programIdsToRemove) {
          const { error: deleteError } = await supabase
            .from("registrations")
            .delete()
            .eq("participant_id", id)
            .eq("program_id", programId);

          if (deleteError) {
            console.error(`Error removing registration for program ${programId}:`, deleteError)
            // Continue with other deletions instead of throwing
          }
        }
      }

      // Add new registrations
      if (programIdsToAdd.length > 0) {
        const currentDate = new Date().toISOString();
        
        // Add each one individually to avoid transaction errors
        for (const programId of programIdsToAdd) {
          // Check if it already exists first (double check)
          const { data: existingReg } = await supabase
            .from("registrations")
            .select('*')
            .eq("participant_id", id)
            .eq("program_id", programId);
            
          if (existingReg && existingReg.length > 0) {
            console.log(`Registration for program ${programId} already exists, skipping`);
            continue;
          }
          
          // Insert new registration
          const { error: insertError } = await supabase
            .from("registrations")
            .insert({
              program_id: programId,
              participant_id: id,
              registration_status: 'Pending',  // Default to pending for new registrations
              registration_date: currentDate,
              updated_at: currentDate
            });

          if (insertError) {
            console.error(`Error adding registration for program ${programId}:`, insertError);
            // Continue with other insertions instead of throwing
          }
        }
      }
    }

    return updatedParticipant
  } catch (error) {
    console.error("Error in updateParticipant:", error)
    throw error
  }
}

export async function deleteParticipant(id: number) {
  const { error } = await supabase.from("participants").delete().eq("id", id)
  if (error) throw error
}

// Expenses
export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, program_id, description, amount, date, category, notes, created_at")
  if (error) throw error
  return data
}

export async function getExpensesByProgram(programId: number) {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, program_id, description, amount, date, category, notes, created_at")
    .eq("program_id", programId)
  if (error) throw error
  return data
}

export async function getExpense(id: number) {
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function createExpense(expense: any) {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        notes: expense.notes || null,
        program_id: expense.program_id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating expense:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createExpense:", error)
    throw error
  }
}

export async function updateExpense(id: number, expense: any) {
  const { data, error } = await supabase.from("expenses").update(expense).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteExpense(id: number) {
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw error
}

export async function getReports() {
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    throw error
  }

  return reports
}

// Users
export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
  if (error) throw error
  return data
}

export async function getUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function getUserByEmail(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`)
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        console.log(`No user found with email: ${email}`)
        return null
      }
      console.error(`Error finding user by email: ${error.message}`)
      throw error
    }
    
    console.log(`Found user: ${data.first_name} ${data.last_name} (${data.username})`)
    return data
  } catch (error) {
    console.error(`Error in getUserByEmail: ${error}`)
    return null
  }
}

export async function getUserByUsername(username: string) {
  try {
    console.log(`Looking for user with username: ${username}`)
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        console.log(`No user found with username: ${username}`)
        return null
      }
      console.error(`Error finding user by username: ${error.message}`)
      throw error
    }
    
    console.log(`Found user: ${data.first_name} ${data.last_name} (${data.email})`)
    return data
  } catch (error) {
    console.error(`Error in getUserByUsername: ${error}`)
    return null
  }
}

export async function createUser(user: any) {
  try {
    console.log("Creating user with email:", user.email)
    
    // First check if user already exists by email
    const { data: existingUserByEmail } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    if (existingUserByEmail) {
      throw new Error("A user with this email already exists")
    }

    // Check if username is taken
    const { data: existingUserByUsername } = await supabase
      .from("users")
      .select("*")
      .eq("username", user.username)
      .maybeSingle()

    if (existingUserByUsername) {
      throw new Error("This username is already taken")
    }

    // Create auth user with email confirmation
    console.log("Creating auth user with email confirmation...")
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          role: user.role,
          is_approved: user.is_approved || false
        },
        emailRedirectTo: `${window.location.origin}/login` // Redirect to login page after confirmation
      }
    })

    if (authError) {
      console.error("Auth error during signup:", authError)
      throw authError
    }

    if (!authData?.user) {
      throw new Error("Failed to create user account")
    }

    console.log("Auth user created with ID:", authData.user.id)
    console.log("Email confirmation status:", authData.user.email_confirmed_at ? "Confirmed" : "Not confirmed")

    // Create user profile
    console.log("Creating user profile...")
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'viewer',
        is_approved: user.is_approved || false,
        approval_code: user.approval_code || null
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      // Try to clean up the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (cleanupError) {
        console.error("Failed to clean up auth user after profile creation error:", cleanupError)
      }
      throw error
    }

    console.log("User profile created successfully")
    return data
  } catch (error) {
    console.error("Error in createUser:", error)
    throw error
  }
}

export async function createParticipantFromUser(userId: string) {
  try {
    // Check if participant already exists for this user
    const { data: existingParticipant, error: checkError } = await supabase
      .from("participants")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing participant:", checkError)
    }

    // If participant already exists, just return it
    if (existingParticipant) {
      return existingParticipant
    }

    // Get the user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user for participant creation:", userError)
      throw userError
    }

    if (!user) {
      throw new Error(`User with ID ${userId} not found`)
    }

    // Create a participant record linked to the user with all user data
    const { data, error } = await supabase
      .from("participants")
      .insert({
        user_id: userId,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // Default values for other fields that aren't in the user profile
        age: 0,
        contact: "",
        address: ""
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating participant from user:", error)
      throw error
    }

    if (!data) {
      throw new Error("Failed to create participant record")
    }

    return data
  } catch (error) {
    console.error("Error in createParticipantFromUser:", error)
    throw error
  }
}

export async function updateUser(id: string, userData: any) {
  const { data, error } = await supabase
    .from("users")
    .update(userData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteUser(id: string) {
  // First delete the user profile
  const { error: profileError } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
  
  if (profileError) throw profileError

  // Then delete the auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  
  if (authError) throw authError
  
  return true
}

// Program Participants
export async function getProgramParticipants(programId: number) {
  const { data, error } = await supabase
    .from('program_participants')
    .select('*')
    .eq('program_id', programId)

  if (error) throw error
  return data
}

export async function addProgramParticipant(data: {
  program_id: number;
  participant_id: number;
  isAdmin?: boolean;
}) {
  try {
    const currentDate = new Date().toISOString();
    
    // First check if the participant is already in the program
    const { data: existingReg, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .match({ 
        program_id: data.program_id, 
        participant_id: data.participant_id 
      })
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing registration:', checkError);
      throw new Error(`Failed to check existing registration: ${checkError.message}`);
    }

    if (existingReg) {
      console.log('Participant already registered:', existingReg);
      throw new Error('Participant is already registered in this program');
    }

    // Create the registration entry
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        program_id: data.program_id,
        participant_id: data.participant_id,
        registration_status: 'Approved',
        registration_date: currentDate,
        updated_at: currentDate
      })
      .select(`
        *,
        participants (
          id,
          first_name,
          last_name,
          age,
          contact,
          email,
          address
        )
      `)
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      throw new Error(`Failed to create registration: ${regError.message}`);
    }

    return registration;
  } catch (error) {
    console.error('Error adding program participant:', error);
    throw error;
  }
}

export async function getProgramsByParticipant(participantId: number) {
  try {
    // Get all programs through registrations
    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select(`
        program_id,
        registration_status,
        programs (
          id,
          name,
          description,
          date,
          time,
          location,
          budget,
          status,
          file_urls,
          created_at,
          updated_at
        )
      `)
      .eq("participant_id", participantId);

    if (regError) throw regError;
    if (!registrations?.length) return [];

    // Transform the data to return just the programs with registration status
    return registrations.map(reg => ({
      ...reg.programs,
      registration_status: reg.registration_status
    }));
  } catch (error) {
    console.error("Error in getProgramsByParticipant:", error);
    throw error;
  }
}

export async function joinProgram(userId: number, programId: number) {
  try {
    const response = await fetch('/api/programs/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, programId }),
    });

    if (!response.ok) {
      throw new Error('Failed to join program');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error joining program:', error);
    throw error;
  }
}

export async function getParticipantForProfile(userId: string) {
  try {
    if (!userId) {
      console.error('getParticipantForProfile: userId is required');
      return null;
    }

    // Get the current user session data to extract email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';
    
    console.log('Fetching profile data for user ID:', userId);

    // Get the participant using direct ID lookup, which is more reliable
    const { data: participantByUserId, error: lookupError } = await supabase
      .from("participants")
      .select('id')
      .eq("user_id", userId)
      .maybeSingle();
      
    // If we found a participant ID, use our robust getParticipant function
    if (!lookupError && participantByUserId && participantByUserId.id) {
      console.log('Found participant ID:', participantByUserId.id, 'for user ID:', userId);
      
      // Use our improved getParticipant function which checks both tables
      const completeParticipantData = await getParticipant(participantByUserId.id);
      console.log('Complete participant data:', completeParticipantData);
      
      if (completeParticipantData) {
        return completeParticipantData;
      }
    } else {
      console.log('No participant found for user ID:', userId);
      if (lookupError) {
        console.error('Error looking up participant:', lookupError);
      }
    }
    
    // If participant doesn't exist, create a simple profile data object
    // but don't actually create a database record
    return {
      id: null,
      user_id: userId,
      first_name: userEmail ? userEmail.split('@')[0] : '',
      last_name: '',
      age: '',
      contact: '',
      email: userEmail,
      address: '',
      program_ids: [],
      programs: [],
      programsData: [],
      is_temporary: true  // Flag to indicate this is not persisted yet
    };
  } catch (error) {
    console.error('Error in getParticipantForProfile:', error);
    return null;
  }
}

export async function getParticipantByUserId(userId: string) {
  try {
    if (!userId) {
      console.error('getParticipantByUserId: userId is required');
      return null;
    }

    const { data, error } = await supabase
      .from("participants")
      .select(`
        *,
        program_participants (
          program_id
        ),
        registrations (
          program_id,
          registration_status
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching participant by user ID:', error);
      return null;
    }

    if (!data) {
      console.warn(`No participant found for user ID: ${userId}`);
      return null;
    }

    // Ensure program_participants exists
    const programParticipants = data.program_participants || [];
    const programIds = programParticipants.map((pp: any) => pp.program_id).filter(Boolean);
    
    // Get registration status data
    const registrations = data.registrations || [];
    const registrationMap = registrations.reduce((map: any, reg: any) => {
      if (reg && reg.program_id) {
        map[reg.program_id] = reg.registration_status;
      }
      return map;
    }, {});

    // Fetch program names if there are any program IDs
    let programs: Array<{id: number, name: string}> = [];
    if (programIds && programIds.length > 0) {
      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, name")
        .in("id", programIds);

      if (!programsError && programsData) {
        programs = programsData;
      } else {
        console.error('Error fetching programs:', programsError);
      }
    }

    return {
      ...data,
      program_ids: programIds || [],
      programs: programs?.map((p: any) => p.name) || [],
      programsData: programs || [],
      registrationStatuses: registrationMap
    };
  } catch (error) {
    console.error('Error in getParticipantByUserId:', error);
    return null;
  }
}

// Registration types and functions
export async function createRegistration(data: {
  program_id: number;
  participant_id: number;
  registration_status?: string;
}) {
  try {
    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        program_id: data.program_id,
        participant_id: data.participant_id,
        registration_status: data.registration_status || 'Pending'
      })
    .select()
      .single();

    if (error) throw error;
    return registration;
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
}

export async function updateRegistrationStatus(
  program_id: number,
  participant_id: number,
  status: string
) {
  try {
    // Validate inputs
    if (!program_id || isNaN(Number(program_id))) {
      return { error: { message: 'Invalid program ID' }, data: null };
    }
    if (!participant_id || isNaN(Number(participant_id))) {
      return { error: { message: 'Invalid participant ID' }, data: null };
    }
    
    // Call the database function to update registration status
    const { data, error } = await supabase.rpc('update_registration_status', {
      p_program_id: Number(program_id),
      p_participant_id: Number(participant_id),
      p_status: status
    });

    if (error) {
      console.error('Error updating registration:', error);
      
      // Check for specific error types
      let errorMessage = 'Failed to update registration';
      
      if (error.code === '23505') {
        errorMessage = 'Duplicate registration entry';
      } else if (error.code === '23514') {
        errorMessage = 'Invalid registration status value';
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      return { 
        error: { message: errorMessage, code: error.code, details: error.details },
        data: null
      };
    }

    // Process the response from the RPC function
    if (!data.success) {
      console.error('Registration update failed:', data.error);
      return { 
        error: { message: data.error || 'Failed to update registration' },
        data: null
      };
    }

    console.log('Registration updated successfully:', data.data);
    return { data: data.data, error: null };
  } catch (error: any) {
    console.error('Error in updateRegistrationStatus:', error);
    return { 
      error: { message: error.message || 'An unexpected error occurred' },
      data: null
    };
  }
}

export async function getRegistrationsByProgram(program_id: number) {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        program_id,
        participant_id,
        registration_status,
        registration_date,
        updated_at,
        participants (
          id,
          first_name,
          last_name,
          age,
          contact,
          email,
          address
        )
      `)
      .eq('program_id', program_id)
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('Error fetching program registrations:', error);
      throw error;
    }

    // Log the fetched registrations for debugging
    console.log('Fetched registrations:', data);

    return data || [];
  } catch (error) {
    console.error('Error fetching program registrations:', error);
    throw error;
  }
}