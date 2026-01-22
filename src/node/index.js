const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 5454;

const cors = require("cors");
app.use(cors());
app.use(express.json());

const { Pool } = require("pg");

// ✅ 環境変数(本番/Actions) → 無ければ local の値
const dbConfig = {
  user: process.env.DB_USER || "user_5454",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "crm_5454",
  password: process.env.DB_PASS || "pass_5454",
  port: Number(process.env.DB_PORT || 5432),
};

// 起動時に「どのDBを見に行くか」必ずログに出す（切り分け最強）
console.log("DB CONFIG =>", {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
});

const pool = new Pool(dbConfig);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err.message);
  }
});

app.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await pool.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [id]
    );
    if (customer.rows.length > 0) {
      res.json(customer.rows[0]);
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM customers WHERE customer_id = $1",
      [id]
    );
    if (result.rowCount > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, industry, contact, location } = req.body;
    const result = await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4, updated_date = CURRENT_TIMESTAMP WHERE customer_id = $5 RETURNING *",
      [companyName, industry, contact, location, id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, customer: result.rows[0] });
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use(express.static("public"));
