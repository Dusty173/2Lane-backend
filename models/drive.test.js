const db = require("../db");

const { BadRequestError, NotFoundError } = require("../expressError");
const Drive = require("./drive");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { describe } = require("node:test");
const { timeStamp } = require("console");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

describe("Create a Drive", function () {
  test("Successfully creates Drive", async function () {
    res = await Drive.create({
      title: "test-drive",
      description: "this is a description",
      route_link: "new_link.com",
    });

    expect(res).toEqual({
      created_at: expect.any(Date),
      title: "test-drive",
      description: "this is a description",
      route_link: "new_link.com",
    });
  });

  test("Throws BadRequest if already exists", async function () {
    try {
      const res = Drive.create("d1", "test-drive-one", "abcdefg.com");
    } catch (err) {
      expect(err instanceof BadRequestError);
    }
  });
});
