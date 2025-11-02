# CSV SQL CLI Examples

This file demonstrates various queries you can run with csvsqlcli.

## Using the employees.csv file

### Basic Queries
```bash
# Show all employees
csvsqlcli query test-data/employees.csv "SELECT * FROM employees"

# Select specific columns
csvsqlcli query test-data/employees.csv "SELECT name, salary FROM employees"

# Get file information
csvsqlcli info test-data/employees.csv
```

### Filtering
```bash
# Find employees with salary > 70000
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE salary > 70000"

# Find employees from New York
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE city = 'New York'"

# Find employees younger than 30
csvsqlcli query test-data/employees.csv "SELECT name, age FROM employees WHERE age < 30"
```

### Combining Conditions
```bash
# AND operator
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE age > 25 AND salary < 80000"

# OR operator
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE city = 'Boston' OR city = 'Chicago'"
```

### Pattern Matching
```bash
# Find names starting with 'J'
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE name LIKE 'J%'"

# Find cities containing 'York'
csvsqlcli query test-data/employees.csv "SELECT * FROM employees WHERE city LIKE '%York%'"
```

### Sorting
```bash
# Sort by salary (ascending)
csvsqlcli query test-data/employees.csv "SELECT * FROM employees ORDER BY salary ASC"

# Sort by age (descending)
csvsqlcli query test-data/employees.csv "SELECT * FROM employees ORDER BY age DESC"
```

### Limiting Results
```bash
# Get top 3 highest salaries
csvsqlcli query test-data/employees.csv "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3"

# Get 2 youngest employees
csvsqlcli query test-data/employees.csv "SELECT name, age FROM employees ORDER BY age ASC LIMIT 2"
```

### Complex Queries
```bash
# Find high earners not in Seattle, sorted by salary
csvsqlcli query test-data/employees.csv "SELECT name, city, salary FROM employees WHERE salary > 70000 AND city != 'Seattle' ORDER BY salary DESC"
```

### Output Formats
```bash
# JSON format
csvsqlcli query test-data/employees.csv "SELECT name, salary FROM employees" --format json

# CSV format (for piping to another CSV tool)
csvsqlcli query test-data/employees.csv "SELECT name, age FROM employees WHERE age < 35" --format csv

# Table format (default, human-readable)
csvsqlcli query test-data/employees.csv "SELECT * FROM employees" --format table
```

## Using the products.csv file

```bash
# Find electronics under $100
csvsqlcli query test-data/products.csv "SELECT product, price FROM products WHERE category = 'Electronics' AND price < 100"

# Get TechCorp products
csvsqlcli query test-data/products.csv "SELECT * FROM products WHERE supplier LIKE 'Tech%'"

# Top 3 most expensive items
csvsqlcli query test-data/products.csv "SELECT product, category, price FROM products ORDER BY price DESC LIMIT 3"

# Low stock items (< 20 units)
csvsqlcli query test-data/products.csv "SELECT product, stock FROM products WHERE stock < 20 ORDER BY stock ASC"
```

## NPX Usage

You can also run the tool without installation:

```bash
npx csvsqlcli query data.csv "SELECT * FROM data WHERE value > 10"
```
