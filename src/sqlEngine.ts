import { CSVRow } from './csvParser';

export interface QueryResult {
  columns: string[];
  rows: CSVRow[];
  rowCount: number;
}

export class SQLEngine {
  constructor(private data: CSVRow[]) {}

  execute(query: string): QueryResult {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.startsWith('select')) {
      return this.executeSelect(query);
    }

    throw new Error('Only SELECT queries are supported');
  }

  private executeSelect(query: string): QueryResult {
    const parsed = this.parseSelectQuery(query);
    let result = [...this.data];

    // Apply WHERE clause
    if (parsed.where) {
      result = this.applyWhere(result, parsed.where);
    }

    // Apply ORDER BY
    if (parsed.orderBy) {
      result = this.applyOrderBy(result, parsed.orderBy);
    }

    // Apply LIMIT
    if (parsed.limit !== null) {
      result = result.slice(0, parsed.limit);
    }

    // Select columns
    const selectedRows = this.selectColumns(result, parsed.columns);
    const columns = parsed.columns[0] === '*' 
      ? (result.length > 0 ? Object.keys(result[0]) : [])
      : parsed.columns;

    return {
      columns,
      rows: selectedRows,
      rowCount: selectedRows.length
    };
  }

  private parseSelectQuery(query: string): {
    columns: string[];
    where?: string;
    orderBy?: { column: string; direction: 'asc' | 'desc' };
    limit: number | null;
  } {
    const selectMatch = query.match(/select\s+(.*?)\s+from/i);
    if (!selectMatch) {
      throw new Error('Invalid SELECT query: missing FROM clause');
    }

    const columnsStr = selectMatch[1].trim();
    const columns = columnsStr === '*' 
      ? ['*'] 
      : columnsStr.split(',').map(c => c.trim());

    const whereMatch = query.match(/where\s+(.*?)(?:\s+order\s+by|\s+limit|\s*$)/i);
    const where = whereMatch ? whereMatch[1].trim() : undefined;

    const orderByMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
    const orderBy = orderByMatch 
      ? { column: orderByMatch[1], direction: (orderByMatch[2]?.toLowerCase() || 'asc') as 'asc' | 'desc' }
      : undefined;

    const limitMatch = query.match(/limit\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : null;

    return { columns, where, orderBy, limit };
  }

  private applyWhere(data: CSVRow[], whereClause: string): CSVRow[] {
    return data.filter(row => {
      return this.evaluateCondition(row, whereClause);
    });
  }

  private evaluateCondition(row: CSVRow, condition: string): boolean {
    // Support AND/OR operators
    if (condition.toLowerCase().includes(' or ')) {
      const parts = condition.split(/\s+or\s+/i);
      return parts.some(part => this.evaluateCondition(row, part.trim()));
    }

    if (condition.toLowerCase().includes(' and ')) {
      const parts = condition.split(/\s+and\s+/i);
      return parts.every(part => this.evaluateCondition(row, part.trim()));
    }

    // Parse simple conditions: column operator value
    const operators = ['>=', '<=', '!=', '=', '>', '<', ' like '];
    
    for (const op of operators) {
      const opRegex = op === ' like ' 
        ? /(\w+)\s+like\s+['"](.+)['"]/i
        : new RegExp(`(\\w+)\\s*${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`, 'i');
      
      const match = condition.match(opRegex);
      if (match) {
        const column = match[1];
        let value: string | number = match[2].replace(/['"]/g, '').trim();
        
        if (!(column in row)) {
          return false;
        }

        const rowValue = row[column];
        
        // Try to convert value to number if comparing with number
        if (typeof rowValue === 'number') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            value = numValue;
          }
        }

        switch (op.trim()) {
          case '=':
            return rowValue == value;
          case '!=':
            return rowValue != value;
          case '>':
            return rowValue > value;
          case '<':
            return rowValue < value;
          case '>=':
            return rowValue >= value;
          case '<=':
            return rowValue <= value;
          case 'like':
            const pattern = (value as string).replace(/%/g, '.*');
            return new RegExp(`^${pattern}$`, 'i').test(String(rowValue));
          default:
            return false;
        }
      }
    }

    return false;
  }

  private applyOrderBy(data: CSVRow[], orderBy: { column: string; direction: 'asc' | 'desc' }): CSVRow[] {
    return [...data].sort((a, b) => {
      const aVal = a[orderBy.column];
      const bVal = b[orderBy.column];

      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return orderBy.direction === 'asc' ? comparison : -comparison;
    });
  }

  private selectColumns(data: CSVRow[], columns: string[]): CSVRow[] {
    if (columns[0] === '*') {
      return data;
    }

    return data.map(row => {
      const newRow: CSVRow = {};
      columns.forEach(col => {
        if (col in row) {
          newRow[col] = row[col];
        }
      });
      return newRow;
    });
  }
}
