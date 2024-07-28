const db = require("../db");
require("supertest");

const { BadRequestError, NotFoundError } = require("../expressError");
const Car = require("./car");
const {
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  commonBeforeAll,
} = require("./_testCommon");
const { describe } = require("node:test");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

// Add a car as a user

describe("Add a car", function () {
  test("Adds car", async function () {
    const data = {
      username: "u1",
      make: "Subaru",
      model: "STI",
      model_year: 2008,
    };
    res = await Car.add(data);

    expect(res).toEqual({
      make: "Subaru",
      model: "STI",
      model_year: 2008,
    });
  });
});

describe("Get cars", function () {
  test("Gets all Cars by username", async function () {
    const cars = await Car.getAll("u1");
    expect(cars).toEqual([]);
  });
});

