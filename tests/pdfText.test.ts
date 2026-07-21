import { describe, expect, it, vi } from "vitest";

import { extractPdfText, type LoadPdfDocument } from "@/lib/interview/pdf-text";

function pdfDataUrl(content = "%PDF-test") {
  return `data:application/pdf;base64,${Buffer.from(content).toString("base64")}`;
}

function minimalTextPdf(text: string): string {
  const escaped = text.replace(/([\\()])/g, "\\$1");
  const stream = `BT /F1 12 Tf 72 720 Td (${escaped}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdfDataUrl(body);
}

describe("PDF resume text extraction", () => {
  it("preserves readable PDF lines across pages and destroys the document", async () => {
    const destroy = vi.fn(async () => undefined);
    const loader: LoadPdfDocument = vi.fn(async (bytes) => {
      expect(Buffer.from(bytes.slice(0, 5)).toString("ascii")).toBe("%PDF-");
      return {
        numPages: 2,
        getPage: async (pageNumber: number) => ({
          getTextContent: async () => ({
            items:
              pageNumber === 1
                ? [
                    { str: "Bachelor of Science", hasEOL: false },
                    { str: "in Computer Science", hasEOL: true },
                  ]
                : [
                    { str: "Built an accessible student portal.", hasEOL: true },
                    { str: "TypeScript, React, CSS", hasEOL: true },
                  ],
          }),
        }),
        destroy,
      };
    });

    await expect(extractPdfText(pdfDataUrl(), loader)).resolves.toBe(
      [
        "Bachelor of Science in Computer Science",
        "Built an accessible student portal.",
        "TypeScript, React, CSS",
      ].join("\n"),
    );
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("extracts text through the installed PDF.js runtime", async () => {
    await expect(
      extractPdfText(minimalTextPdf("BS Computer Science")),
    ).resolves.toContain("BS Computer Science");
  });

  it("rejects data that is not a PDF before loading a document", async () => {
    const loader = vi.fn() as unknown as LoadPdfDocument;
    await expect(extractPdfText(pdfDataUrl("not-a-pdf"), loader)).rejects.toThrow(
      /not a PDF/i,
    );
    expect(loader).not.toHaveBeenCalled();
  });

  it("rejects image-only PDFs with no selectable text", async () => {
    const loader: LoadPdfDocument = async () => ({
      numPages: 1,
      getPage: async () => ({ getTextContent: async () => ({ items: [] }) }),
      destroy: async () => undefined,
    });
    await expect(extractPdfText(pdfDataUrl(), loader)).rejects.toThrow(
      /selectable resume text/i,
    );
  });
});
