# csvsqlcli

Query CSV files using SQL syntax from the command line.

## Installation

You can use this tool without installation via `npx`:

```bash
npx csvsqlcli query <file.csv> "<SQL query>"
```

Or install globally:

```bash
npm install -g csvsqlcli
```

## Features

- Execute SQL queries on CSV files
- Support for SELECT, WHERE, ORDER BY, LIMIT clauses
- Multiple output formats: table, JSON, CSV
- Comparison operators: =, !=, <, >, <=, >=
- Logical operators: AND, OR
- Pattern matching with LIKE operator
- Automatic numeric type detection

## Usage

### Query Command

Execute a SQL query on a CSV file:

```bash
csvsqlcli query employees.csv "SELECT * FROM employees"
```

#### Select specific columns:

```bash
csvsqlcli query employees.csv "SELECT name, age FROM employees"
```

#### Filter with WHERE clause:

```bash
csvsqlcli query employees.csv "SELECT * FROM employees WHERE age > 30"
```

#### Sort results:

```bash
csvsqlcli query employees.csv "SELECT * FROM employees ORDER BY salary DESC"
```

#### Combine multiple clauses:

```bash
csvsqlcli query employees.csv "SELECT name, salary FROM employees WHERE salary > 70000 ORDER BY salary DESC LIMIT 5"
```

#### Use different output formats:

```bash
# JSON format
csvsqlcli query employees.csv "SELECT * FROM employees" --format json

# CSV format
csvsqlcli query employees.csv "SELECT * FROM employees" --format csv

# Table format (default)
csvsqlcli query employees.csv "SELECT * FROM employees" --format table
```

### Info Command

Display information about a CSV file:

```bash
csvsqlcli info employees.csv
```

## Supported SQL Features

### SELECT Clause
- `SELECT *` - Select all columns
- `SELECT column1, column2` - Select specific columns

### WHERE Clause
- Comparison operators: `=`, `!=`, `<`, `>`, `<=`, `>=`
- Logical operators: `AND`, `OR`
- Pattern matching: `LIKE` (with `%` wildcard)

Example:
```sql
SELECT * FROM table WHERE age > 25 AND salary < 80000
SELECT * FROM table WHERE name LIKE "J%"
```

### ORDER BY Clause
- `ORDER BY column ASC` - Sort ascending (default)
- `ORDER BY column DESC` - Sort descending

### LIMIT Clause
- `LIMIT n` - Return only first n rows

## Examples

Given a CSV file `employees.csv`:
```csv
name,age,city,salary
John,30,New York,75000
Jane,25,Los Angeles,65000
Bob,35,Chicago,80000
Alice,28,Boston,70000
```

### Query Examples

```bash
# Get all employees from New York
csvsqlcli query employees.csv "SELECT * FROM employees WHERE city = 'New York'"

# Get top 3 highest salaries
csvsqlcli query employees.csv "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3"

# Find employees with salary between 65000 and 75000
csvsqlcli query employees.csv "SELECT * FROM employees WHERE salary >= 65000 AND salary <= 75000"

# Get employees whose names start with 'J'
csvsqlcli query employees.csv "SELECT * FROM employees WHERE name LIKE 'J%'"
```

## Development

### Prerequisites
- Node.js >= 16.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/tarsislimadev/csvsqlcli.git
cd csvsqlcli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## License

MIT
