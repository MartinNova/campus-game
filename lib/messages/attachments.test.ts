import { describe, expect, it } from "vitest";
import {
  fileLabel,
  fileTypeOf,
  formatFileSize,
  MAX_FILE_BYTES,
  safeFileName,
  validateFile,
} from "./attachments";

const pdf = { name: "Slides.pdf", type: "application/pdf", size: 200_000 };

describe("fileTypeOf", () => {
  it("uses the browser's type, or the extension if it's missing", () => {
    expect(fileTypeOf(pdf)).toBe("application/pdf");
    expect(fileTypeOf({ name: "grades.CSV", type: "" })).toBe("text/csv");
    expect(fileTypeOf({ name: "virus.exe", type: "application/x-msdownload" })).toBeNull();
  });
});

describe("validateFile", () => {
  it("accepts allowed files within the limit", () => {
    expect(validateFile(pdf, MAX_FILE_BYTES)).toBeNull();
  });

  it("rejects other types, empty and too big files", () => {
    expect(validateFile({ ...pdf, name: "app.exe", type: "" }, MAX_FILE_BYTES)).toMatch(/type/);
    expect(validateFile({ ...pdf, size: 0 }, MAX_FILE_BYTES)).toMatch(/empty/);
    expect(validateFile({ ...pdf, size: MAX_FILE_BYTES + 1 }, MAX_FILE_BYTES)).toMatch(/10 MB/);
  });
});

describe("formatFileSize", () => {
  it("picks a readable unit", () => {
    expect(formatFileSize(820)).toBe("820 B");
    expect(formatFileSize(14_500)).toBe("14 KB");
    expect(formatFileSize(2.3 * 1024 * 1024)).toBe("2.3 MB");
  });
});

describe("fileLabel / safeFileName", () => {
  it("shows the extension", () => {
    expect(fileLabel("Notes.docx")).toBe("DOCX");
    expect(fileLabel("README")).toBe("FILE");
  });

  it("makes names safe for storage", () => {
    expect(safeFileName("Übung 3 (final).pdf")).toBe("_bung_3__final_.pdf");
    expect(safeFileName("..hidden")).toBe("hidden");
  });
});
