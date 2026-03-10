// ─── Profile Data Models ─────────────────────────────────────────────

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface ResumeProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Parser Types ────────────────────────────────────────────────────

export interface ParseResult {
  rawText: string;
  extractedFields: Partial<ResumeProfile>;
  confidence: number; // 0-1, rough estimate of extraction quality
}

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain';

// ─── API Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProfileListItem {
  id: string;
  name: string;
  email: string;
  summary: string;
  updatedAt: string;
}
