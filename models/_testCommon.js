const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM drives");

  await db.query(
    `INSERT INTO users (username, hashed_pw, email, is_admin) 
        VALUES ('u1', $1, 'u1@email.com', false), ('u2', $2, 'u2@email.com', false) RETURNING username, email, is_admin`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(`INSERT INTO drives (title, description, route_link) 
    VALUES ('d1', 'test-drive-one', 'abcdefg.com'), ('d2', 'test-drive-two', 'abdefgxyz.com')`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
