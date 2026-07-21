import path from "node:path";
import { pathToFileURL } from "node:url";

import { InterviewAIError } from "@/lib/interview/openai";

const MAX_PDF_PAGES = 100;
const MAX_PDF_TEXT_CHARACTERS = 100_000;

type PdfTextItem = {
  str?: unknown;
  hasEOL?: unknown;
};

type PdfPage = {
  getTextContent: () => Promise<{ items: PdfTextItem[] }>;
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};

export type LoadPdfDocument = (data: Uint8Array) => Promise<PdfDocument>;

function resolvePdfWorkerSrc(): string {
  return pathToFileURL(
    path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ),
  ).href;
}

const loadPdfDocument: LoadPdfDocument = async (data) => {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = resolvePdfWorkerSrc();
    const task = pdfjs.getDocument({
      data,
      // Prefer main-thread parsing in Node/Next so the worker import path
      // does not need to survive the Turbopack rewrite of node_modules URLs.
      useWorkerFetch: false,
      useSystemFonts: true,
    });
    const document = await task.promise;
    return {
      numPages: document.numPages,
      getPage: async (pageNumber) => {
        const page = await document.getPage(pageNumber);
        return {
          getTextContent: async () => {
            const content = await page.getTextContent();
            const items: PdfTextItem[] = content.items.map((item) =>
              "str" in item
                ? { str: item.str, hasEOL: item.hasEOL }
                : { str: undefined, hasEOL: false },
            );
            return { items };
          },
        };
      },
      destroy: () => task.destroy(),
    };
  } catch (error) {
    if (error instanceof InterviewAIError) throw error;
    throw new InterviewAIError(
      "provider",
      error instanceof Error
        ? error.message
        : "PDF.js failed to load the resume document.",
    );
  }
};

function decodePdfDataUrl(fileData: string): Uint8Array {
  const base64 = fileData.includes(",") ? (fileData.split(",").pop() ?? "") : fileData;
  if (!base64) {
    throw new InterviewAIError("invalid_output", "The PDF contains no readable data.");
  }

  try {
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    const signature = Buffer.from(bytes.slice(0, 5)).toString("ascii");
    if (signature !== "%PDF-") {
      throw new InterviewAIError("invalid_output", "The uploaded file is not a PDF.");
    }
    return bytes;
  } catch (error) {
    if (error instanceof InterviewAIError) throw error;
    throw new InterviewAIError("invalid_output", "The PDF could not be decoded.");
  }
}

function appendItem(line: string, text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return line;
  if (!line) return cleaned;
  if (/^[,.;:!?%)\]}]/.test(cleaned)) return `${line}${cleaned}`;
  return `${line} ${cleaned}`;
}

export async function extractPdfText(
  fileData: string,
  loader: LoadPdfDocument = loadPdfDocument,
): Promise<string> {
  const document = await loader(decodePdfDataUrl(fileData));
  const lines: string[] = [];
  let characterCount = 0;

  try {
    const pageCount = Math.min(document.numPages, MAX_PDF_PAGES);
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      let line = "";

      for (const item of content.items) {
        if (typeof item.str !== "string") continue;
        line = appendItem(line, item.str);
        if (item.hasEOL && line) {
          lines.push(line);
          characterCount += line.length + 1;
          line = "";
        }
        if (characterCount >= MAX_PDF_TEXT_CHARACTERS) break;
      }
      if (line && characterCount < MAX_PDF_TEXT_CHARACTERS) {
        lines.push(line);
        characterCount += line.length + 1;
      }
      if (characterCount >= MAX_PDF_TEXT_CHARACTERS) break;
    }
  } catch (error) {
    if (error instanceof InterviewAIError) throw error;
    throw new InterviewAIError("invalid_output", "Text could not be read from the PDF.");
  } finally {
    await document.destroy().catch(() => undefined);
  }

  const text = lines.join("\n").trim().slice(0, MAX_PDF_TEXT_CHARACTERS);
  if (!text) {
    throw new InterviewAIError(
      "invalid_output",
      "The PDF does not contain selectable resume text.",
    );
  }
  return text;
}
