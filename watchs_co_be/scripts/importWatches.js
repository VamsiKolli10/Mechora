if (process.env.NODE_ENV !== "test") require("dotenv").config();
const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const csv = require("fast-csv");
const { insertWatch } = require("../models/watchesModel");
const { withTransaction } = require("../utils/transaction");
const db = require("../db");

const slugFor = (row) => {
  const base = [row.Brand || row.brand, row.Model || row.model, row.Reference || row.reference]
    .filter(Boolean).join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base || "watch"}-${randomUUID().slice(0, 8)}`;
};

const importCSV = async (filePath, { input = null } = {}) => {
  if (!input && !filePath) throw new Error("Usage: node scripts/importWatches.js <file.csv>");
  return withTransaction(async (client) => {
    const source = input || fs.createReadStream(filePath);
    const parser = csv.parse({ headers: true, ignoreEmpty: true, trim: true });
    source.on("error", error => parser.destroy(error));
    source.pipe(parser);
    try {
      let count = 0;
      for await (const row of parser) {
        const model = row.Model || row.model;
        const rawPrice = row.Price ?? row.sale_price;
        const priceText = String(rawPrice ?? "").replace(/[$,]/g, "").trim();
        const salePrice = Number(priceText);
        const quantity = Number(row.stock_quantity ?? 0);
        if (!model || !priceText || !Number.isFinite(salePrice) || salePrice < 0 ||
            !Number.isInteger(quantity) || quantity < 0) {
          throw new Error(`Invalid model, price, or stock quantity on CSV row ${count + 2}`);
        }
        await insertWatch({
          brand: row.Brand || row.brand,
          model,
          reference: row.Reference || row.reference,
          complication: row.Complication || row.complication,
          case_material: row["Case material"] || row.case_material,
          bracelet_material: row["Bracelet material"] || row.bracelet_material,
          dial: row.Dial || row.dial,
          hour_markings: row["Hour Markings"] || row.hour_markings,
          lunette_material: row["Lunette Material"] || row.lunette_material,
          sale_price: salePrice,
          stock_quantity: quantity,
          stock_status: quantity ? "in_stock" : "out_of_stock",
          slug: row.slug || slugFor(row),
        }, client);
        count += 1;
      }
      return count;
    } finally {
      source.destroy();
      parser.destroy();
    }
  });
};

if (require.main === module) {
  importCSV(process.argv[2] || process.env.WATCH_CSV_PATH)
    .then(count => console.log(`CSV import completed: ${count} watches`))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => db.close());
}
module.exports = { importCSV };
