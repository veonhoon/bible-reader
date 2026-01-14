// Document parsing service for PDF and DOCX files
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - use the bundled worker for v5+
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ParseResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

export async function parsePDF(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      success: true,
      text: fullText.trim(),
      pageCount,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function parseDOCX(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      success: true,
      text: result.value.trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function parseDocument(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return parseDOCX(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please upload a PDF or DOCX file.',
    };
  }
}
