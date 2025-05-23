-- Create or replace the function to handle registration status updates
CREATE OR REPLACE FUNCTION update_registration_status(
    p_program_id BIGINT,
    p_participant_id BIGINT,
    p_status TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_registration_date timestamptz;
BEGIN
    -- Validate status
    IF p_status NOT IN ('Approved', 'Pending', 'Rejected', 'Waitlisted') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid status value. Must be one of: Approved, Pending, Rejected, Waitlisted'
        );
    END IF;

    -- Check if program exists
    IF NOT EXISTS (SELECT 1 FROM programs WHERE id = p_program_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Program not found'
        );
    END IF;

    -- Check if participant exists
    IF NOT EXISTS (SELECT 1 FROM participants WHERE id = p_participant_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Participant not found'
        );
    END IF;

    -- Get existing registration date if any
    SELECT registration_date INTO v_registration_date
    FROM registrations
    WHERE program_id = p_program_id AND participant_id = p_participant_id;

    -- If no existing registration_date, use current timestamp
    IF v_registration_date IS NULL THEN
        v_registration_date := NOW();
    END IF;

    -- Insert or update the registration
    INSERT INTO registrations (
        program_id,
        participant_id,
        registration_status,
        registration_date,
        updated_at
    )
    VALUES (
        p_program_id,
        p_participant_id,
        p_status,
        v_registration_date,
        NOW()
    )
    ON CONFLICT (program_id, participant_id) DO UPDATE
    SET 
        registration_status = EXCLUDED.registration_status,
        updated_at = NOW()
    RETURNING jsonb_build_object(
        'id', program_id,
        'participant_id', participant_id,
        'status', registration_status,
        'registration_date', registration_date,
        'updated_at', updated_at
    ) INTO v_result;

    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;
