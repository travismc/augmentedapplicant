import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { uploadResume } from '@/lib/utils/storage';

const WELCOME_BONUS_AMOUNT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get form data from the request
    const formData = await request.formData();
    const jobTitles = formData.get('jobTitles') as string;
    const industries = formData.get('industries') as string;
    const locations = formData.get('locations') as string;
    const resumeFile = formData.get('resume') as File | null;

    // Validate required fields
    if (!jobTitles?.trim() || !industries?.trim() || !locations?.trim()) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate field lengths
    if (jobTitles.split(',').length > 5 || industries.split(',').length > 5 || locations.split(',').length > 5) {
      return new NextResponse('Maximum 5 items allowed for each preference', { status: 400 });
    }

    // Upload resume if provided
    let resumeUrl = null;
    if (resumeFile) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(resumeFile.type)) {
        return new NextResponse('Invalid file type. Please upload a PDF or DOC file', { status: 400 });
      }

      // Validate file size
      if (resumeFile.size > MAX_FILE_SIZE) {
        return new NextResponse('File size too large. Maximum size is 10MB', { status: 400 });
      }

      resumeUrl = await uploadResume(userId, resumeFile);
      if (!resumeUrl) {
        return new NextResponse('Error uploading resume', { status: 500 });
      }
    }

    // Check if user has already completed onboarding
    const { data: existingPreferences } = await supabaseAdmin
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    // Save user preferences
    const { error: preferencesError } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: userId,
        job_titles: jobTitles.split(',').map(t => t.trim()).filter(Boolean),
        industries: industries.split(',').map(i => i.trim()).filter(Boolean),
        locations: locations.split(',').map(l => l.trim()).filter(Boolean),
        resume_url: resumeUrl,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (preferencesError) {
      console.error('Error saving preferences:', preferencesError);
      return new NextResponse('Error saving preferences', { status: 500 });
    }

    // Add welcome bonus credits only if user hasn't completed onboarding before
    let creditsError = null;
    if (!existingPreferences?.onboarding_completed) {
      const { error } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: WELCOME_BONUS_AMOUNT,
          transaction_type: 'welcome_bonus',
          description: 'Welcome bonus credits'
        });
      creditsError = error;

    if (creditsError) {
      console.error('Error adding welcome credits:', creditsError);
      return new NextResponse('Error adding welcome credits', { status: 500 });
    }

      // Update user's credit balance
      if (!creditsError) {
        const { error: updateBalanceError } = await supabaseAdmin
          .from('user_profiles')
          .update({ 
            credits_balance: supabaseAdmin.sql`credits_balance + ${WELCOME_BONUS_AMOUNT}`
          })
          .eq('user_id', userId);
        creditsError = updateBalanceError;
      }

    if (updateBalanceError) {
      console.error('Error updating credit balance:', updateBalanceError);
      return new NextResponse('Error updating credit balance', { status: 500 });
    }

    return new NextResponse(JSON.stringify({
      message: 'Onboarding completed successfully',
      credits_added: !existingPreferences?.onboarding_completed ? WELCOME_BONUS_AMOUNT : 0,
      is_new_user: !existingPreferences?.onboarding_completed
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in onboarding:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
