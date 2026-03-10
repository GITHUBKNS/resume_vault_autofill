import type { ParseResult, ResumeProfile } from '../types';

/**
 * Parse a PDF file buffer and extract resume text + fields.
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<ParseResult> {
  // Dynamic import to avoid issues in non-browser environments
  const pdfjsLib = await import('pdfjs-dist');

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  const rawText = pages.join('\n\n');
  const extractedFields = extractFieldsFromText(rawText);

  return {
    rawText,
    extractedFields,
    confidence: estimateConfidence(extractedFields),
  };
}

// ─── Heuristic Field Extraction ──────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

function extractFieldsFromText(text: string): Partial<ResumeProfile> {
  const fields: Partial<ResumeProfile> = {};

  // Extract email
  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) fields.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(PHONE_REGEX);
  if (phoneMatch) fields.phone = phoneMatch[0].trim();

  // Extract name (assume first non-empty line is the name)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    // Only use as name if it's reasonably short and doesn't look like a section header
    if (firstLine.length < 60 && !firstLine.includes('@')) {
      fields.name = firstLine;
    }
  }

  // Extract skills (look for common section headers)
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'technologies', 'proficiencies']);
  if (skillsSection) {
    fields.skills = skillsSection
      .split(/[,;|•·●▪►]\s*|\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
  }

  // Extract summary
  const summarySection = extractSection(text, ['summary', 'objective', 'about', 'profile']);
  if (summarySection) {
    fields.summary = summarySection.slice(0, 500);
  }

  return fields;
}

function extractSection(text: string, headers: string[]): string | null {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*(?:${headers.join('|')})\\s*[:\\-]?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:experience|education|skills|projects|certifications|references|work|employment)\\s*[:\\-]?\\s*\\n|$)`,
    'i'
  );
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function estimateConfidence(fields: Partial<ResumeProfile>): number {
  let score = 0;
  const checks = ['name', 'email', 'phone', 'summary', 'skills'] as const;
  for (const key of checks) {
    const value = fields[key];
    if (value && (typeof value === 'string' ? value.length > 0 : (value as string[]).length > 0)) {
      score += 0.2;
    }
  }
  return Math.min(score, 1);
}
