import { supabaseAdmin } from '../db/supabase';

export async function uploadResume(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading resume:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadResume:', error);
    return null;
  }
}
