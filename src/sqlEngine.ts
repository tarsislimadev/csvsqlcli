import { CSVRow } from './csvParser';

export interface QueryResult {
  columns: string[];
  rows: CSVRow[];
  rowCount: number;
}

export class SQLEngine {
  private static readonly MAX_QUERY_LENGTH = 10000;
  
  constructor(private data: CSVRow[]) {}

  execute(query: string): QueryResult {
    // Prevent ReDoS by limiting query length
    if (query.length > SQLEngine.MAX_QUERY_LENGTH) {
      throw new Error('Query is too long');
    }
    
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
    // Normalize whitespace to prevent ReDoS
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    
    // Use simple indexOf-based parsing instead of complex regex
    const selectIdx = normalizedQuery.toLowerCase().indexOf('select ');
    const fromIdx = normalizedQuery.toLowerCase().indexOf(' from');
    
    if (selectIdx === -1 || fromIdx === -1 || fromIdx <= selectIdx) {
      throw new Error('Invalid SELECT query: missing FROM clause');
    }

    const columnsStr = normalizedQuery.substring(selectIdx + 7, fromIdx).trim();
    const columns = columnsStr === '*' 
      ? ['*'] 
      : columnsStr.split(',').map(c => c.trim());

    // Extract WHERE clause
    const whereIdx = normalizedQuery.toLowerCase().indexOf(' where ', fromIdx);
    const orderByIdx = normalizedQuery.toLowerCase().indexOf(' order by', fromIdx);
    const limitIdx = normalizedQuery.toLowerCase().indexOf(' limit', fromIdx);
    
    let where: string | undefined;
    if (whereIdx !== -1) {
      const whereEnd = orderByIdx !== -1 ? orderByIdx : (limitIdx !== -1 ? limitIdx : normalizedQuery.length);
      where = normalizedQuery.substring(whereIdx + 7, whereEnd).trim();
    }

    // Extract ORDER BY
    let orderBy: { column: string; direction: 'asc' | 'desc' } | undefined;
    if (orderByIdx !== -1) {
      const orderByEnd = limitIdx !== -1 ? limitIdx : normalizedQuery.length;
      const orderByStr = normalizedQuery.substring(orderByIdx + 10, orderByEnd).trim();
      const parts = orderByStr.split(' ');
      orderBy = {
        column: parts[0],
        direction: (parts[1]?.toLowerCase() === 'desc' ? 'desc' : 'asc')
      };
    }

    // Extract LIMIT
    let limit: number | null = null;
    if (limitIdx !== -1) {
      const limitStr = normalizedQuery.substring(limitIdx + 7).trim();
      const limitNum = parseInt(limitStr, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        limit = limitNum;
      }
    }

    return { columns, where, orderBy, limit };
  }

  private applyWhere(data: CSVRow[], whereClause: string): CSVRow[] {
    return data.filter(row => {
      return this.evaluateCondition(row, whereClause);
    });
  }

  private evaluateCondition(row: CSVRow, condition: string): boolean {
    // Normalize whitespace
    const normalized = condition.replace(/\s+/g, ' ').trim();
    const lowerCondition = normalized.toLowerCase();
    
    // Support AND/OR operators - use indexOf for safety
    if (lowerCondition.indexOf(' or ') !== -1) {
      const parts = normalized.split(/ or /i);
      return parts.some(part => this.evaluateCondition(row, part.trim()));
    }

    if (lowerCondition.indexOf(' and ') !== -1) {
      const parts = normalized.split(/ and /i);
      return parts.every(part => this.evaluateCondition(row, part.trim()));
    }

    // Parse simple conditions: column operator value
    // Use indexOf-based parsing to avoid ReDoS
    const operators = [
      { op: '>=', len: 2 },
      { op: '<=', len: 2 },
      { op: '!=', len: 2 },
      { op: '>', len: 1 },
      { op: '<', len: 1 },
      { op: '=', len: 1 }
    ];
    
    // Check for LIKE operator first
    const likeIdx = lowerCondition.indexOf(' like ');
    if (likeIdx !== -1) {
      const column = normalized.substring(0, likeIdx).trim();
      const afterLike = normalized.substring(likeIdx + 6).trim();
      
      // Extract value from quotes
      const quoteMatch = afterLike.match(/^['"]([^'"]+)['"]$/);
      if (quoteMatch && column in row) {
        // Escape regex special characters to prevent ReDoS
        const escapedPattern = quoteMatch[1]
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/%/g, '.*');
        return new RegExp(`^${escapedPattern}$`, 'i').test(String(row[column]));
      }
      return false;
    }
    
    // Check for comparison operators
    for (const { op, len } of operators) {
      const opIdx = normalized.indexOf(op);
      if (opIdx > 0) {
        const column = normalized.substring(0, opIdx).trim();
        let value: string | number = normalized.substring(opIdx + len).trim().replace(/['"]/g, '');
        
        if (!(column in row)) {
          continue; // Try next operator
        }

        const rowValue = row[column];
        
        // Convert value to the same type as rowValue for comparison
        let compareValue: string | number = value;
        if (typeof rowValue === 'number') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            compareValue = numValue;
          }
        } else if (typeof rowValue === 'string' && typeof value === 'number') {
          compareValue = String(value);
        }

        switch (op) {
          case '=':
            return rowValue === compareValue;
          case '!=':
            return rowValue !== compareValue;
          case '>':
            return rowValue > compareValue;
          case '<':
            return rowValue < compareValue;
          case '>=':
            return rowValue >= compareValue;
          case '<=':
            return rowValue <= compareValue;
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
