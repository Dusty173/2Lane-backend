const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/updateSql");

class Post {
  static async getAll() {
    let res = await db.query(
      `SELECT id, title, body, user_id, created_at FROM posts`
    );

    if (!res) throw new NotFoundError("Unable to retrieve Posts");

    return res.rows;
  }

  static async get(id) {
    let res = await db.query(
      `SELECT id, title, body, user_id, created_at FROM posts WHERE id = $1`,
      [id]
    );

    if (!res) throw new NotFoundError("Unable to retrieve Posts");

    return res.rows;
  }

  static async create(data) {
    const { title, body, user_id } = data;

    const res = await db.query(
      `INSERT INTO posts (title, body, user_id, created_at) 
        VALUES ($1, $2, $3, $4) RETURNING title, body, user_id, created_at`,
      [title, body, user_id, new Date()]
    );

    let post = res.rows[0];

    return post;
  }

  static async remove(data) {
    const res = await db.query(
      `DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING title`,
      [data.id, data.userId]
    );

    let deleted = res.rows[0];
    if (!deleted) throw new NotFoundError("Unable to find post to remove");

    return deleted;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      body: "body",
    });
    const handleIdx = "$" + (values.length + 1);

    const querySql = `UPDATE posts SET ${setCols} WHERE id = ${handleIdx} RETURNING title, body, created_at`;

    const res = await db.query(querySql, [...values, id]);
    const post = res.rows[0];

    if (!post) throw new NotFoundError(`Post ${id} does not exist.`);

    return post;
  }
}
module.exports = Post;
