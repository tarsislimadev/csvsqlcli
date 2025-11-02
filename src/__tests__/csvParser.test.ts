import { CSVParser } from '../csvParser';
import * as fs from 'fs';
import * as path from 'path';

describe('CSVParser', () => {
  const testDir = path.join(__dirname, '../../test-fixtures');
  const testFile = path.join(testDir, 'test.csv');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(testFile, 'name,age,city\nJohn,30,NYC\nJane,25,LA\n');
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  test('should load CSV file', async () => {
    const parser = new CSVParser(testFile);
    await parser.load();
    
    const data = parser.getData();
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('name', 'John');
    expect(data[0]).toHaveProperty('age', 30);
  });

  test('should parse headers correctly', async () => {
    const parser = new CSVParser(testFile);
    await parser.load();
    
    const headers = parser.getHeaders();
    expect(headers).toEqual(['name', 'age', 'city']);
  });

  test('should throw error for non-existent file', async () => {
    const parser = new CSVParser('nonexistent.csv');
    await expect(parser.load()).rejects.toThrow('File not found');
  });

  test('should convert numeric values', async () => {
    const parser = new CSVParser(testFile);
    await parser.load();
    
    const data = parser.getData();
    expect(typeof data[0].age).toBe('number');
    expect(data[0].age).toBe(30);
  });
});
