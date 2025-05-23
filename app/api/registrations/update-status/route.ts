import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { program_id, participant_id, status } = await request.json();
    
    // Validate required fields
    if (!program_id || !participant_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: program_id, participant_id, status' },
        { status: 400 }
      );
    }
    
    console.log('API: Updating registration status:', { program_id, participant_id, status });
    
    // Validate status
    const validStatuses = ['Approved', 'Pending', 'Rejected', 'Waitlisted'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // First check if the registration exists
    const { data: existingReg, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('program_id', program_id)
      .eq('participant_id', participant_id);

    if (checkError) {
      console.error('API: Error checking registration:', checkError);
      return NextResponse.json(
        { error: `Failed to check registration: ${checkError.message}` },
        { status: 500 }
      );
    }

    console.log('Existing registration check result:', existingReg);
    
    // Note: We don't update participants table anymore as registration_status is only in the registrations table

    let result;
    
    if (!existingReg || existingReg.length === 0) {
      console.log('API: Registration not found, creating new one');
      
      // If registration doesn't exist, create it
      const { data: newReg, error: createError } = await supabase
        .from('registrations')
        .insert({
          program_id,
          participant_id,
          registration_status: status,
          registration_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (createError) {
        console.error('API: Error creating registration:', createError);
        return NextResponse.json(
          { error: `Failed to create registration: ${createError.message}` },
          { status: 500 }
        );
      }
      
      console.log('Created new registration:', newReg);
      result = newReg;
    } else {
      console.log('API: Registration found, updating status');
      
      console.log('Updating registration with:', { program_id, participant_id, status });
      
      // If we found the registration, update it
      const { data: updatedReg, error: updateError } = await supabase
        .from('registrations')
        .update({ 
          registration_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('program_id', program_id)
        .eq('participant_id', participant_id)
        .select('*');
        
      console.log('Update result:', { data: updatedReg, error: updateError });

      if (updateError) {
        console.error('API: Error updating registration:', updateError);
        return NextResponse.json(
          { error: `Failed to update registration: ${updateError.message}` },
          { status: 500 }
        );
      }
      
      console.log('Updated registration:', updatedReg);
      result = updatedReg;
    }

    // Double-check the registration to ensure it was saved
    const { data: verifyReg } = await supabase
      .from('registrations')
      .select('*')
      .eq('program_id', program_id)
      .eq('participant_id', participant_id)
      .single();
      
    console.log('Verification check:', verifyReg);
      
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Registration status updated to ${status}`,
      data: result,
      current_status: verifyReg?.registration_status || status,
      timestamp: new Date().toISOString() 
    });
    
  } catch (error: any) {
    console.error('API: Unexpected error in update-status:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
