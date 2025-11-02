// Example: Using csvsqlcli as a library in your Node.js application

import { CSVParser, SQLEngine } from 'csvsqlcli';

async function queryCSV() {
  // Load CSV file
  const parser = new CSVParser('data.csv');
  await parser.load();

  // Create SQL engine
  const engine = new SQLEngine(parser.getData());

  // Execute query
  const result = engine.execute('SELECT * FROM data WHERE value > 10');

  // Process results
  console.log(`Found ${result.rowCount} rows`);
  result.rows.forEach(row => {
    console.log(row);
  });
}

queryCSV().catch(console.error);
