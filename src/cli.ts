#!/usr/bin/env node

import { Command } from 'commander';
import { CSVParser } from './csvParser';
import { SQLEngine, QueryResult } from './sqlEngine';
import * as fs from 'fs';

const program = new Command();

program
  .name('csvsqlcli')
  .description('Query CSV files using SQL')
  .version('1.0.0');

program
  .command('query')
  .description('Execute SQL query on a CSV file')
  .argument('<file>', 'Path to CSV file')
  .argument('<sql>', 'SQL query to execute')
  .option('-f, --format <type>', 'Output format (table|json|csv)', 'table')
  .action(async (file: string, sql: string, options: { format: string }) => {
    try {
      const parser = new CSVParser(file);
      await parser.load();

      const engine = new SQLEngine(parser.getData());
      const result = engine.execute(sql);

      displayResult(result, options.format);
      
      console.log(`\n${result.rowCount} row(s) returned`);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('Start interactive SQL mode for a CSV file')
  .argument('<file>', 'Path to CSV file')
  .action(async (file: string) => {
    console.log('Interactive mode is not yet implemented.');
    console.log('Use: csvsqlcli query <file> "<sql>"');
    process.exit(0);
  });

program
  .command('info')
  .description('Show information about a CSV file')
  .argument('<file>', 'Path to CSV file')
  .action(async (file: string) => {
    try {
      if (!fs.existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }

      const parser = new CSVParser(file);
      await parser.load();

      const headers = parser.getHeaders();
      const data = parser.getData();

      console.log('\nFile:', file);
      console.log('Columns:', headers.length);
      console.log('Rows:', data.length);
      console.log('\nColumn names:');
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header}`);
      });
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

function displayResult(result: QueryResult, format: string): void {
  if (result.rows.length === 0) {
    console.log('\nNo results found.');
    return;
  }

  switch (format) {
    case 'json':
      console.log(JSON.stringify(result.rows, null, 2));
      break;
    case 'csv':
      displayCSV(result);
      break;
    case 'table':
    default:
      displayTable(result);
      break;
  }
}

function displayTable(result: QueryResult): void {
  const columns = result.columns;
  const rows = result.rows;

  // Calculate column widths
  const widths = columns.map((col: string) => {
    const dataWidths = rows.map((row) => String(row[col] || '').length);
    return Math.max(col.length, ...dataWidths, 3);
  });

  // Print header
  console.log();
  const header = columns.map((col: string, i: number) => 
    col.padEnd(widths[i])
  ).join(' | ');
  console.log(header);
  console.log(widths.map((w: number) => '-'.repeat(w)).join('-+-'));

  // Print rows
  rows.forEach((row) => {
    const line = columns.map((col: string, i: number) => 
      String(row[col] || '').padEnd(widths[i])
    ).join(' | ');
    console.log(line);
  });
}

function displayCSV(result: QueryResult): void {
  const columns = result.columns;
  const rows = result.rows;

  console.log(columns.join(','));
  rows.forEach((row) => {
    const values = columns.map((col: string) => {
      const value = String(row[col] || '');
      // Escape values containing comma or quotes
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    console.log(values.join(','));
  });
}

// If no command specified, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse();
