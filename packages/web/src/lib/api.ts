import type { ProfileListItem, ResumeProfile, ParseResult } from '@resume-vault/core';
import { parseResume, type SupportedMimeType } from '@resume-vault/core';
import { supabase } from './supabase';

// ─── Profiles ────────────────────────────────────────────────────────

export async function getProfiles(): Promise<ProfileListItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, summary, updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    summary: row.summary,
    updatedAt: row.updated_at,
  }));
}

export async function getProfile(id: string): Promise<ResumeProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    summary: data.summary,
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createProfile(profile: Partial<ResumeProfile>): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      summary: profile.summary || '',
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateProfile(id: string, profile: Partial<ResumeProfile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      summary: profile.summary || '',
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Client-Side Resume Parsing ──────────────────────────────────────

const MIME_MAP: Record<string, SupportedMimeType> = {
  'application/pdf': 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain': 'text/plain',
};

export async function uploadResume(file: File): Promise<ParseResult> {
  const mimeType = MIME_MAP[file.type];
  if (!mimeType) {
    throw new Error(`Unsupported file type: ${file.type}. Supported: PDF, DOCX, TXT`);
  }

  const buffer = await file.arrayBuffer();
  return parseResume(buffer, mimeType);
}
