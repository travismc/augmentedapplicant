import { supabaseAdmin } from '../db/supabase';
import { auth } from '@clerk/nextjs/server';
import type { UserProfile, UserPreferences } from '../db/types';
import { AuthError, DatabaseError, ValidationError, validateUserData } from './errors';
import { PostgrestError } from '@supabase/supabase-js';

export async function getCurrentUser() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      throw new AuthError('No authenticated user', 'auth/no-user');
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        *,
        user_preferences!inner (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new DatabaseError('User profile not found', 'db/not-found');
      }
      throw new DatabaseError('Error fetching user profile', 'db/fetch-error', error);
    }

    if (!profile) {
      throw new DatabaseError('User profile not found', 'db/not-found');
    }

    return profile;
  } catch (error) {
    if (error instanceof AuthError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      'Unexpected error fetching user',
      'db/unexpected',
      error
    );
  }
}

export async function syncUserToSupabase(userId: string, email: string, fullName?: string) {
  try {
    // Validate input data
    validateUserData(userId, email, fullName);
    
    const now = new Date().toISOString();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new DatabaseError('Error checking existing user', 'db/check-error', checkError);
    }

    // Start a transaction
    const { error: transactionError } = await supabaseAdmin.rpc('begin_transaction');
    if (transactionError) {
      throw new DatabaseError('Error starting transaction', 'db/transaction-error', transactionError);
    }

    try {
      // Create or update user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            email: email,
            full_name: fullName,
            credits_balance: existingUser ? undefined : 0, // Only set initial balance for new users
            is_admin: false,
            updated_at: now
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (profileError) {
        throw new DatabaseError(
          'Error creating/updating user profile',
          'db/profile-error',
          profileError
        );
      }

      if (!profile) {
        throw new DatabaseError('Failed to create user profile', 'db/profile-create-failed');
      }

      // Initialize user preferences if they don't exist
      const { error: preferencesError } = await supabaseAdmin
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            job_titles: [],
            industries: [],
            locations: [],
            onboarding_completed: false,
            updated_at: now
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: true // Only insert if doesn't exist
          }
        );

      if (preferencesError) {
        throw new DatabaseError(
          'Error creating user preferences',
          'db/preferences-error',
          preferencesError
        );
      }

      // Commit transaction
      const { error: commitError } = await supabaseAdmin.rpc('commit_transaction');
      if (commitError) {
        throw new DatabaseError('Error committing transaction', 'db/commit-error', commitError);
      }

      return profile;
    } catch (error) {
      // Rollback on any error
      const { error: rollbackError } = await supabaseAdmin.rpc('rollback_transaction');
      if (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }

      if (error instanceof DatabaseError) {
        throw error;
      }

      if (error instanceof PostgrestError) {
        throw new DatabaseError(
          'Database operation failed',
          'db/operation-failed',
          error
        );
      }

      throw new DatabaseError('Unexpected error syncing user', 'db/unexpected', error);
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
    
    if (error instanceof ValidationError || 
        error instanceof DatabaseError || 
        error instanceof AuthError) {
      throw error;
    }
    
    throw new DatabaseError('Unexpected error', 'db/unexpected', error);
  }
}
