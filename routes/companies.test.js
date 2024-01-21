process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.')RETURNING *`,
  );
  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query("DELETE FROM companies");
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });

  test("Get one company by code", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    testCompany.invoices = [];
    expect(res.body).toEqual({ company: testCompany });
  });
  test(" Testing 404 Get one company by code ", async () => {
    const res = await request(app).get(`/companies/appl`);
    expect(res.statusCode).toBe(404);
    testCompany.invoices = [];
    expect(res.body).toEqual({
      error: {
        message: `Company appl not found`,
        status: 404,
      },
      message: "Company appl not found",
    });
  });
});

describe("Post /companies", () => {
  test("Create new company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "ibm", name: "ibm", description: "technologies" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: "ibm", name: "ibm", description: "technologies" },
    });
  });
});

describe("Put /companies", () => {
  test(" Update company name and description ", async () => {
    const res = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "apple", description: "Macbook pro" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: "apple", name: "apple", description: "Macbook pro" },
    });
  });
  test(" Testing 404 Update one company by code ", async () => {
    const res = await request(app).put(`/companies/appl`);
    expect(res.statusCode).toBe(404);
    testCompany.invoices = [];
    expect(res.body).toEqual({
      error: {
        message: `Company appl not found`,
        status: 404,
      },
      message: "Company appl not found",
    });
  });
});

describe("Delete /companies", () => {
  test(" Delete company  ", async () => {
    const code = testCompany.code;
    const res = await request(app).delete(`/companies/${testCompany.code}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: `Company ${code} Deleted` });
  });
  test(" Testing 404 Delete one company by code ", async () => {
    const res = await request(app).delete(`/companies/appl`);
    expect(res.statusCode).toBe(404);
    testCompany.invoices = [];
    expect(res.body).toEqual({
      error: {
        message: `Company appl not found`,
        status: 404,
      },
      message: "Company appl not found",
    });
  });
});
