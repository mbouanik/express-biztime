const express = require("express");
const router = express.Router();
let db = require("../db");
const ExpressError = require("../expressError");

router.get("", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM companies`);
  return res.json({ companies: result.rows });
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const company = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);
    if (company.rows.length === 0) {
      throw new ExpressError(`Company ${code} not found`, 404);
    }
    const invoice = await db.query(
      `SELECT * FROM invoices WHERE comp_code = $1`,
      [code],
    );
    const result = company.rows[0];
    result.invoices = invoice.rows;

    return res.json({ company: result });
  } catch (e) {
    return next(e);
  }
});

// router.get("/:code", async (req, res, next) => {
//   try {
//     const { code } = req.params;
//     const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
//       code,
//     ]);
//     if (result.rows.length === 0) {
//       throw new ExpressError(`Company ${code} not found`, 404);
//     }
//     return res.json({ company: result.rows[0] });
//   } catch (e) {
//     return next(e);
//   }
// });
//
router.post("", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
      [code, name, description],
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [name, description, code],
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company ${code} not found`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await db.query(`DELETE FROM companies WHERE code=$1`, [
      code,
    ]);
    if (result.rowCount === 0) {
      throw new ExpressError(`Company ${code} not found`, 404);
    }
    return res.json({ msg: `Company ${code} Deleted` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
