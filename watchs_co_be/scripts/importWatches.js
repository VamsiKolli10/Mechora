require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const csv = require("fast-csv");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS watches (
      id SERIAL PRIMARY KEY,
      brand TEXT,
      model TEXT,
      reference TEXT,
      complication TEXT,
      case_material TEXT,
      bracelet_material TEXT,
      dial TEXT,
      hour_markings TEXT,
      lunette_material TEXT,
      price NUMERIC
    );
  `;
  await pool.query(query);
};

const importCSV = async () => {
  await createTable();

  const stream = fs.createReadStream(
    "/Users/vamsikolli/Downloads/watch_data.csv"
  );
  const csvStream = csv
    .parse({ headers: true })
    .on("data", async (row) => {
      await pool.query(
        `INSERT INTO watches (
          brand, model, reference, complication, case_material,
          bracelet_material, dial, hour_markings, lunette_material, price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          row["Brand"],
          row["Model"],
          row["Reference"],
          row["Complication"],
          row["Case material"],
          row["Bracelet material"],
          row["Dial"],
          row["Hour Markings"],
          row["Lunette Material"],
          row["Price"],
        ]
      );
    })
    .on("end", () => {
      console.log("CSV import completed.");
      pool.end();
    });

  stream.pipe(csvStream);
};

importCSV();
