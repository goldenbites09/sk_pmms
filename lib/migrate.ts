import { supabase } from './supabase'

// Sample data from the application
const programsData = [
  {
    name: "Youth Leadership Workshop",
    description: "A comprehensive workshop focused on developing leadership skills among the youth in our barangay. The program aims to equip young individuals with essential leadership qualities, communication skills, and project management abilities that will help them become effective leaders in their communities.",
    date: "2025-05-15",
    time: "9:00 AM - 4:00 PM",
    location: "Barangay Hall, Conference Room",
    budget: 15000,
    status: "Active",
  },
  {
    name: "Community Clean-up Drive",
    description: "A community initiative to clean up public spaces and promote environmental awareness among residents. This program aims to beautify our community spaces while educating participants about proper waste management and environmental conservation.",
    date: "2025-05-10",
    time: "7:00 AM - 11:00 AM",
    location: "Community Park and Surrounding Streets",
    budget: 8000,
    status: "Active",
  }
]

const participantsData = [
  { program_id: 1, name: "Juan Dela Cruz", age: 18, contact: "09123456789" },
  { program_id: 1, name: "Maria Santos", age: 19, contact: "09234567890" },
  { program_id: 1, name: "Pedro Reyes", age: 17, contact: "09345678901" },
  { program_id: 1, name: "Ana Gonzales", age: 20, contact: "09456789012" },
  { program_id: 1, name: "Jose Rizal", age: 18, contact: "09567890123" },
  { program_id: 2, name: "Carlos Magno", age: 22, contact: "09678901234" },
  { program_id: 2, name: "Sofia Reyes", age: 16, contact: "09789012345" },
  { program_id: 2, name: "Miguel Santos", age: 18, contact: "09890123456" }
]

const expensesData = [
  { program_id: 1, description: "Venue Rental", amount: 5000, date: "2025-05-15", category: "Facilities", notes: "Rental fee for the conference room at the Barangay Hall" },
  { program_id: 1, description: "Refreshments", amount: 3000, date: "2025-05-15", category: "Food", notes: "Morning and afternoon snacks for 25 participants" },
  { program_id: 1, description: "Speaker Honorarium", amount: 4000, date: "2025-05-15", category: "Services", notes: "Payment for the resource speaker" },
  { program_id: 1, description: "Materials and Handouts", amount: 2000, date: "2025-05-10", category: "Supplies", notes: "Printed materials, notebooks, and pens for participants" },
  { program_id: 1, description: "Certificates", amount: 1000, date: "2025-05-14", category: "Supplies", notes: "Printed certificates for participants" },
  { program_id: 2, description: "Cleaning Supplies", amount: 3500, date: "2025-05-08", category: "Supplies", notes: "Trash bags, gloves, and cleaning tools" },
  { program_id: 2, description: "Refreshments", amount: 2000, date: "2025-05-10", category: "Food", notes: "Water and snacks for volunteers" },
  { program_id: 2, description: "T-shirts for Volunteers", amount: 2500, date: "2025-05-05", category: "Supplies", notes: "Customized t-shirts for the clean-up drive volunteers" }
]

export async function migrateData() {
  try {
    // Insert programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .insert(programsData)
      .select()
    
    if (programsError) {
      console.error('Error creating programs:', programsError)
      throw programsError
    }

    console.log('Programs created successfully')

    // Insert participants
    const { error: participantsError } = await supabase
      .from('participants')
      .insert(participantsData)
    
    if (participantsError) {
      console.error('Error creating participants:', participantsError)
      throw participantsError
    }

    console.log('Participants created successfully')

    // Insert expenses
    const { error: expensesError } = await supabase
      .from('expenses')
      .insert(expensesData)
    
    if (expensesError) {
      console.error('Error creating expenses:', expensesError)
      throw expensesError
    }

    console.log('Expenses created successfully')
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
} 