const db = require("../db");

const { BadRequestError, NotFoundError } = require("../expressError");
const Post = require("./posts");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { describe } = require("node:test");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

describe("Get Posts", function () {
  test("Get All Posts", async function () {
    const res = await Post.getAll();
    expect(res).toEqual([]);
  });
});

describe("Creates a Post", function () {
  test("Successfully Creates a Post", async function () {
    const getId = await db.query(`SELECT id FROM users WHERE username = 'u1'`);
    const userId = getId.rows[0].id;

    const res = await Post.create({
      title: "Test Post",
      body: "This is the post body",
      user_id: userId,
    });

    expect(res).toEqual({
      title: "Test Post",
      body: "This is the post body",
      created_at: expect.any(Date),
      user_id: userId,
    });
  });
});
