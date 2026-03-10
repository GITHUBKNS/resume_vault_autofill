import type { ParseResult, SupportedMimeType } from '../types';
import { parsePdf } from './pdf-parser';
import { parseDocx } from './docx-parser';

/**
 * Parse a resume file and extract structured data.
 * Routes to the correct parser based on MIME type.
 */
export async function parseResume(
  buffer: ArrayBuffer,
  mimeType: SupportedMimeType
): Promise<ParseResult> {
  switch (mimeType) {
    case 'application/pdf':
      return parsePdf(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDocx(buffer);

    case 'text/plain': {
      const rawText = new TextDecoder().decode(buffer);
      return {
        rawText,
        extractedFields: {},
        confidence: 0.1,
      };
    }

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export { parsePdf } from './pdf-parser';
export { parseDocx } from './docx-parser';
