const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 5454;

const cors = require("cors");
app.use(cors());
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  // Local dev
  user: "user_5454",
  host: "db",
  database: "crm_5454",
  password: "pass_5454",

  // Production
  // user: "user_toshiki_kobayashi",
  // host: "localhost",
  // database: "db_toshiki_kobayashi",
  // password: "5Rw5YDaWc5jc",
  port: 5432,
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [id]);
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
    const result = await pool.query("DELETE FROM customers WHERE customer_id = $1", [id]);
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
    res.json({ success: false });
  }
});

app.use(express.static("public"));
