/**
 * CSV Parser for Whatnot transaction exports
 * 
 * Expected CSV columns:
 * - Date: "Jan 31, 2026, 11:21:45 PM"
 * - Amount: "$26.25" or "-$25.00"
 * - Listing ID: "1413081375" or empty
 * - Order ID: "798710137" or empty
 * - Message: "Earnings for selling a ..."
 * - Status: "processing" or "completed"
 * - Transaction Type: "SALES" or "ADJUSTMENT"
 */

export interface ParsedWhatnotTransaction {
  transactionDate: Date;
  amount: number;
  listingId: string | null;
  orderId: string | null;
  message: string | null;
  status: string | null;
  transactionType: "SALES" | "ADJUSTMENT";
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedWhatnotTransaction[];
  errors: string[];
  skippedRows: number;
}

/**
 * Parse a dollar amount string like "$26.25" or "-$25.00" to a number
 */
function parseAmount(amountStr: string): number {
  // Remove $ and any whitespace, handle negative amounts
  const cleaned = amountStr.replace(/[$,\s]/g, "");
  const value = parseFloat(cleaned);
  if (isNaN(value)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  return value;
}

/**
 * Parse Whatnot date format like "Jan 31, 2026, 11:21:45 PM" to Date
 */
function parseWhatnotDate(dateStr: string): Date {
  // The format is: "MMM DD, YYYY, HH:MM:SS AM/PM"
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Parse Whatnot CSV content into structured transactions
 */
export function parseWhatnotCSV(csvContent: string): ParseResult {
  const lines = csvContent.trim().split("\n");
  const transactions: ParsedWhatnotTransaction[] = [];
  const errors: string[] = [];
  let skippedRows = 0;

  if (lines.length === 0) {
    return { success: false, transactions: [], errors: ["Empty CSV content"], skippedRows: 0 };
  }

  // Parse header to validate format
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.replace(/"/g, "").toLowerCase());
  
  const expectedHeaders = ["date", "amount", "listing id", "order id", "message", "status", "transaction type"];
  const hasValidHeaders = expectedHeaders.every((h, i) => headers[i]?.includes(h.split(" ")[0]));
  
  if (!hasValidHeaders) {
    return {
      success: false,
      transactions: [],
      errors: [`Invalid CSV format. Expected headers: ${expectedHeaders.join(", ")}`],
      skippedRows: 0
    };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      skippedRows++;
      continue;
    }

    try {
      const fields = parseCSVLine(line);
      
      if (fields.length < 7) {
        errors.push(`Row ${i + 1}: Not enough fields (got ${fields.length}, expected 7)`);
        skippedRows++;
        continue;
      }

      const [dateStr, amountStr, listingId, orderId, message, status, transactionType] = fields;

      // Validate transaction type
      const cleanType = transactionType.replace(/"/g, "").toUpperCase();
      if (cleanType !== "SALES" && cleanType !== "ADJUSTMENT") {
        errors.push(`Row ${i + 1}: Invalid transaction type "${transactionType}"`);
        skippedRows++;
        continue;
      }

      transactions.push({
        transactionDate: parseWhatnotDate(dateStr.replace(/"/g, "")),
        amount: parseAmount(amountStr.replace(/"/g, "")),
        listingId: listingId.replace(/"/g, "") || null,
        orderId: orderId.replace(/"/g, "") || null,
        message: message.replace(/"/g, "") || null,
        status: status.replace(/"/g, "") || null,
        transactionType: cleanType as "SALES" | "ADJUSTMENT"
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Parse error"}`);
      skippedRows++;
    }
  }

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    skippedRows
  };
}
