# CSV-SQL CLI

**Query your CSV files like a relational database!**

This command-line tool allows you to perform SQL queries on your CSV files, making it easy to work with tabular data without the need for a full-fledged database.

## Features

*   **Powerful SQL Queries:** Use standard SQL `SELECT` statements to filter, sort, and manipulate your data.
*   **Multiple CSV Files:** Work with multiple CSV files as if they were database tables.
*   **Easy to Use:** Simple and intuitive command-line interface.
*   **No Database Required:** All you need are your CSV files.

## Installation

To install `csvsqlcli`, you need to have Node.js and npm installed. Then, you can install the tool globally using the following command:

```bash
npm install -g csvsqlcli
```

## How to Run

Once installed, you can use `csvsqlcli` from your terminal. Here's how to run a query:

```bash
csvsqlcli <path_to_csv_files> "<your_sql_query>"
```

**Example:**

Let's say you have a directory named `data` with two CSV files: `products.csv` and `orders.csv`. You can run a query like this:

```bash
csvsqlcli ./data "SELECT * FROM products WHERE price > 100"
```

This will return all the products with a price greater than 100.

## Contributing

We welcome contributions from the community! If you'd like to contribute, please fork the repository and submit a pull request.

## Contributors

*   Tarsis Lima ([GitHub](https://github.com/tarsislimadev), [LinkedIn](https://www.linkedin.com/in/tarsislimadev/), [YouTube](https://www.youtube.com/@tarsislimadev))

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.