import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

export interface CSVRow {
  [key: string]: string | number;
}

export class CSVParser {
  private data: CSVRow[] = [];
  private headers: string[] = [];

  constructor(private filePath: string) {}

  async load(): Promise<void> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const content = fs.readFileSync(this.filePath, 'utf-8');
    
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Try to parse as number
        if (context.header) {
          return value;
        }
        const num = parseFloat(value);
        if (!isNaN(num) && value.trim() !== '') {
          return num;
        }
        return value;
      }
    });

    this.data = records;
    if (records.length > 0) {
      this.headers = Object.keys(records[0]);
    }
  }

  getData(): CSVRow[] {
    return this.data;
  }

  getHeaders(): string[] {
    return this.headers;
  }
}
