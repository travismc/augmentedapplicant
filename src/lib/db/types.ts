export type CreditTransactionType = 
  | 'welcome_bonus'
  | 'purchase'
  | 'refund'
  | 'admin_adjustment'
  | 'referral_bonus';

export type UserProfile = {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  industry: string;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: number;
  user_id: string;
  theme: string;
  email_notifications: boolean;
  credits_balance: number;
  created_at: string;
  updated_at: string;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: CreditTransactionType;
  description?: string;
  reference_id?: string;
  created_at: string;
};

export type Resume = {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  content_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResumeVersion = {
  id: string;
  resume_id: string;
  version_number: number;
  file_path: string;
  changes_summary?: string;
  created_at: string;
};

export type JobApplication = {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_description?: string;
  resume_version_id?: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'completed';
  credits_used: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>;
        Update: never; // Transactions should never be updated
      };
      resumes: {
        Row: Resume;
        Insert: Omit<Resume, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Resume, 'id' | 'created_at' | 'updated_at'>>;
      };
      resume_versions: {
        Row: ResumeVersion;
        Insert: Omit<ResumeVersion, 'id' | 'created_at'>;
        Update: never; // Versions should never be updated
      };
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
