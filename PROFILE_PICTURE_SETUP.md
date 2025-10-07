# Profile Picture Implementation Guide

## Step 1: Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `ryspfqoxnzdrhrqiiqht`
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ Check this (allows public read access)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`
6. Click **"Create bucket"**

## Step 2: Run SQL Commands

### Option A: Using Supabase SQL Editor (Recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the following SQL:

```sql
-- Add profile_picture_url column to participants table
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_profile_picture ON participants(profile_picture_url);
```

4. Click **"Run"** to execute

### Option B: Apply Storage Policies

After creating the bucket, apply these policies in the SQL Editor:

```sql
-- Policy 1: Allow users to upload their own profile picture
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow public read access to profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

## Step 3: Verify Setup

Run this query to verify the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participants' 
AND column_name = 'profile_picture_url';
```

Run this query to verify storage policies:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

## Step 4: Test Storage Access

In the Supabase Dashboard:
1. Go to **Storage** > **profile-pictures**
2. Try uploading a test image manually
3. Check if you can view/download it
4. Delete the test image

## Bucket Configuration Summary

- **Bucket Name**: `profile-pictures`
- **Public Access**: Yes (read-only)
- **File Path Pattern**: `{user_id}/{filename}`
- **Max File Size**: 5MB
- **Allowed Types**: JPEG, PNG, WebP, GIF

## Security Notes

✅ Users can only upload/update/delete their own pictures (folder named with their user_id)
✅ Public can view all profile pictures (read-only)
✅ File size limited to prevent abuse
✅ Only image MIME types allowed

## Next Steps

After completing the setup above, the application code will be updated to:
- Upload profile pictures to Supabase Storage
- Display profile pictures in the UI
- Handle image deletion when changing pictures
- Validate file types and sizes
