const db = require("../db");

const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../expressError");

const User = require("./user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

1;
const { fail } = require("assert");
const supertest = require("supertest");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

// Authorization Tests --------------------------------------

describe("Authentication", function () {
  test("Works if correct data passed in.", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      is_admin: false,
      username: "u1",
    });
  });

  test("Unauthorized if no user exists", async function () {
    try {
      await User.authenticate("Invalid", "User");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("Unauthorized if Incorrect Password", async function () {
    try {
      await User.authenticate("u1", "incorrect");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

// Registration Tests ---------------------------------------

describe("Registration", function () {
  const newUser = {
    username: "Testuser",
    email: "test@email.com",
    is_admin: false,
  };

  test("Working registration", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query(
      "SELECT * FROM users WHERE username = 'Testuser'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].hashed_pw.startsWith("$2b$")).toEqual(true);
  });

  test("Can add admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      is_admin: true,
    });
    expect(user).toEqual({ ...newUser, is_admin: true });
    const found = await db.query(
      "SELECT * FROM users WHERE username = 'Testuser'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].hashed_pw.startsWith("$2b$")).toEqual(true);
  });

  test("Throws BadRequestError with duplicate data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// Find All users Test---------------------------------------------

describe("Finds All users", function () {
  test("Works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "u1",
        email: "u1@email.com",
        is_admin: false,
      },
      {
        username: "u2",
        email: "u2@email.com",
        is_admin: false,
      },
    ]);
  });
});

// Finds user requested by username ------------------------------

describe("Finds a User by username", function () {
  test("Get works", async function () {
    let user = await User.get("u1");
    expect(user).toMatchObject({
      username: "u1",
      email: "u1@email.com",
      is_admin: false,
    });
  });
  test("NotFoundError works", async function () {
    try {
      await User.get("Notauser");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// Update a user -------------------------------------------------

describe("Updates user", function () {
  const upData = {
    username: "updated",
    email: "updated@email.com",
    is_admin: true,
  };

  test("Updates successfully", async function () {
    let update = await User.updateUser("u2", upData);
    expect(update).toEqual({
      username: "updated",
      email: "updated@email.com",
      is_admin: true,
    });
  });

  test("Updates password successfully", async function () {
    let update = await User.updateUser("u2", {
      hashed_pw: "updatedpw",
    });
    expect(update).toEqual({
      username: "u2",
      email: "u2@email.com",
      is_admin: false,
    });
    const dbcheck = await db.query(
      "SELECT * FROM users WHERE username = 'u2' "
    );
    expect(dbcheck.rows.length).toEqual(1);
    expect(dbcheck.rows[0].hashed_pw.startsWith("$2b$")).toEqual(true);
  });

  test("Throws NotFound if no User", async function () {
    try {
      await User.updateUser("notauser", {
        username: "stillnotauser",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// Removing a user ----------------------------------------------------------------

describe("Removes a User", function () {
  test("Removed successfully", async function () {
    await User.removeUser("u1");
    const res = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("Throws NotFound if no User", async function () {
    try {
      await User.removeUser("notauser");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
