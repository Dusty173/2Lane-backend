const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/updateSql.js");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ExpressError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  static async authenticate(username, password) {
    const res = await db.query(
      `SELECT username, hashed_pw, is_admin FROM users WHERE username = $1`,
      [username]
    );
    const user = res.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.hashed_pw);
      if (isValid === true) {
        delete user.hashed_pw;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username or password");
  }

  static async register({ username, password, email, is_admin }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );
    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Username ${username} already exists.`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    if (!is_admin) is_admin = false;
    const res = await db.query(
      `INSERT INTO users (username, hashed_pw, email, created_at, is_admin) 
        VALUES ($1, $2, $3, $4, $5) RETURNING username, email, created_at, is_admin`,
      [username, hashedPassword, email, new Date(), is_admin]
    );

    const user = res.rows[0];

    return user;
  }

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  email,
                  is_admin
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  email,
                  is_admin
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  static async getPosts(username) {
    const userRes = await db.query(
      `SELECT id, username
          FROM users WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user ${username} exists.`);

    const postRes =
      await db.query(`SELECT p.user_id p.title, p.body, p.created_at FROM posts AS p 
        JOIN users AS u WHERE p.user_id = u.id`);

    user.posts = postRes.rows.map((p) => p.user_id);
    return user;
  }

  static async getCars(username) {
    const userRes = await db.query(
      `SELECT id, username, email, is_admin 
        FROM users WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user ${username} exists.`);

    const carsRes = await db.query(
      `SELECT c.owner_id FROM cars AS c JOIN users AS u WHERE c.owner_id = u.id`
    );

    user.cars = carsRes.rows.map((c) => c.id);
    return user;
  }

  static async getDrives(username) {
    const userRes = await db.query(
      `SELECT id, username, email, is_admin 
        FROM users WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user ${username} exists.`);

    const driveRes = await db.query(
      `SELECT d.drive_id, d.user_id FROM users_drives AS d JOIN users AS u WHERE d.user_id = u.id`
    );

    user.drives = driveRes.rows.map((d) => d.id);
    return user;
  }

  static async updateUser(username, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      username: "username",
      email: "email",
      is_admin: "is_admin",
    });
    const usernameIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users SET ${setCols} WHERE username = ${usernameIdx}
    RETURNING username, email, is_admin`;

    const res = await db.query(querySql, [...values, username]);

    const user = res.rows[0];

    if (!user)
      throw new NotFoundError(`Unable to update profile ${username} 
        because it does not exist`);

    delete user.hashed_pw;

    return user;
  }

  static async removeUser(username) {
    let res = await db.query(
      `DELETE FROM users WHERE username = $1 RETURNING username`,
      [username]
    );
    const user = res.rows[0];

    if (!user) throw new NotFoundError(`Username ${username} does not exist`);
  }
}

module.exports = User;
