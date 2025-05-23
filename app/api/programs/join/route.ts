import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, programId } = await request.json();

    if (!userId || !programId) {
      return NextResponse.json(
        { error: 'User ID and Program ID are required' },
        { status: 400 }
      );
    }

    // Check if user is already in the program
    const { data: existingParticipant, error: checkError } = await supabase
      .from('program_participants')
      .select('*, participants!inner(*)')
      .eq('participants.user_id', userId)
      .eq('program_id', programId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing participant:', checkError);
      return NextResponse.json(
        { error: 'Failed to check program participation' },
        { status: 500 }
      );
    }

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You are already a participant in this program' },
        { status: 400 }
      );
    }

    // Get the participant ID for the user
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (participantError) {
      console.error('Error fetching participant:', participantError);
      return NextResponse.json(
        { error: 'Participant profile not found' },
        { status: 404 }
      );
    }

    // Add user to program_participants
    const { data: result, error: insertError } = await supabase
      .from('program_participants')
      .insert([{ program_id: programId, participant_id: participant.id }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting program participant:', insertError);
      return NextResponse.json(
        { error: 'Failed to join program' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in join program:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 