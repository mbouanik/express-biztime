process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async () => {
  const resCompany = await db.query(
    `INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`,
  );

  const resInvoice = await db.query(
    `INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('apple', 100, false, null)`,
  );
  testInvoice = resInvoice.rows[0];
});

afterEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
  });
});
