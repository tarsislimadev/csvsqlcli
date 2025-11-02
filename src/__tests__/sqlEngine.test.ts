import { SQLEngine } from '../sqlEngine';
import { CSVRow } from '../csvParser';

describe('SQLEngine', () => {
  const testData: CSVRow[] = [
    { name: 'John', age: 30, salary: 75000 },
    { name: 'Jane', age: 25, salary: 65000 },
    { name: 'Bob', age: 35, salary: 80000 },
    { name: 'Alice', age: 28, salary: 70000 }
  ];

  test('should execute SELECT * query', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table');
    
    expect(result.rows).toHaveLength(4);
    expect(result.columns).toEqual(['name', 'age', 'salary']);
  });

  test('should select specific columns', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT name, age FROM table');
    
    expect(result.rows).toHaveLength(4);
    expect(result.columns).toEqual(['name', 'age']);
    expect(result.rows[0]).toHaveProperty('name');
    expect(result.rows[0]).toHaveProperty('age');
    expect(result.rows[0]).not.toHaveProperty('salary');
  });

  test('should apply WHERE clause with =', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE age = 30');
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('John');
  });

  test('should apply WHERE clause with >', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE salary > 70000');
    
    expect(result.rows).toHaveLength(2);
  });

  test('should apply WHERE clause with AND', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE age > 25 AND salary < 80000');
    
    expect(result.rows).toHaveLength(2);
  });

  test('should apply WHERE clause with OR', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE age = 25 OR age = 30');
    
    expect(result.rows).toHaveLength(2);
  });

  test('should apply ORDER BY ASC', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table ORDER BY age ASC');
    
    expect(result.rows[0].age).toBe(25);
    expect(result.rows[3].age).toBe(35);
  });

  test('should apply ORDER BY DESC', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table ORDER BY salary DESC');
    
    expect(result.rows[0].salary).toBe(80000);
    expect(result.rows[3].salary).toBe(65000);
  });

  test('should apply LIMIT', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table LIMIT 2');
    
    expect(result.rows).toHaveLength(2);
  });

  test('should combine WHERE, ORDER BY, and LIMIT', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT name, salary FROM table WHERE salary >= 70000 ORDER BY salary DESC LIMIT 2');
    
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].salary).toBe(80000);
    expect(result.rows[1].salary).toBe(75000);
  });

  test('should support LIKE operator', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE name LIKE "J%"');
    
    expect(result.rows).toHaveLength(2);
  });

  test('should throw error for unsupported query type', () => {
    const engine = new SQLEngine(testData);
    expect(() => engine.execute('UPDATE table SET age = 30')).toThrow('Only SELECT queries are supported');
  });

  test('should return empty result for no matches', () => {
    const engine = new SQLEngine(testData);
    const result = engine.execute('SELECT * FROM table WHERE age > 100');
    
    expect(result.rows).toHaveLength(0);
  });
});
