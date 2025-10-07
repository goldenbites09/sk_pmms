import { supabase } from './supabase'

const BUCKET_NAME = 'profile-pictures'

/**
 * Upload a profile picture to Supabase Storage
 * @param userId - The user's ID (used for folder organization)
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error: any) {
    console.error('Error uploading profile picture:', error)
    throw new Error(error.message || 'Failed to upload profile picture')
  }
}

/**
 * Delete a profile picture from Supabase Storage
 */
export async function deleteProfilePicture(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      throw error
    }
  } catch (error: any) {
    console.error('Error deleting profile picture:', error)
    throw new Error(error.message || 'Failed to delete profile picture')
  }
}

/**
 * Extract file path from Supabase Storage URL
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split(`/${BUCKET_NAME}/`)
    return pathParts[1] || null
  } catch {
    return null
  }
}
