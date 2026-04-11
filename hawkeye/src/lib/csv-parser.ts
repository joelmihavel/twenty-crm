// Lightweight CSV parser - no external dependencies
// Handles quoted fields, commas within quotes, and newlines within quotes

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

// Parse a CSV string into an array of objects keyed by header
export function parseCsv(text: string): CsvParseResult {
  const errors: string[] = [];

  if (!text.trim()) {
    return { headers: [], rows: [], errors: ["File is empty"] };
  }

  const lines = splitCsvLines(text);

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ["No data found in file"] };
  }

  const headers = parseCsvLine(lines[0]);

  if (headers.length === 0) {
    return { headers: [], rows: [], errors: ["No headers found in file"] };
  }

  // Check for duplicate headers
  const seen = new Set<string>();
  for (const header of headers) {
    if (seen.has(header.toLowerCase())) {
      errors.push(`Duplicate header: "${header}"`);
    }
    seen.add(header.toLowerCase());
  }

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCsvLine(line);

    if (values.length !== headers.length) {
      errors.push(
        `Row ${i}: expected ${headers.length} columns but found ${values.length}`,
      );
      // Still include the row, padding or truncating as needed
    }

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }

  return { headers, rows, errors };
}

// Split a CSV text into logical lines (handling quoted newlines)
function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "\n" && !inQuotes) {
      if (current.endsWith("\r")) {
        current = current.slice(0, -1);
      }
      lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Push the last line
  if (current.trim()) {
    lines.push(current);
  }

  return lines;
}

// Parse a single CSV line into field values
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current.trim());

  return fields;
}

// Convert a File to string
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
