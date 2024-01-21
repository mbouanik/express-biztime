const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
let db = require("../db");

router.get("", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.get("/companies/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const company = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);

    const invoice = await db.query(
      `SELECT * FROM invoices WHERE comp_code = $1`,
      [code],
    );

    if (company.rows.length === 0) {
      throw new ExpressError(`Company ${code} not found`, 404);
    }
    return res.json({ company: company.rows[0], invoices: invoice.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *",
      [comp_code, amt],
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`,
      [amt, id],
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice  not found`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      throw new ExpressError(`Invoice not found`, 404);
    }
    return res.json({ msg: `Invoice Deleted` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
