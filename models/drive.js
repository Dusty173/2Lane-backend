const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/updateSql");

class Drive {
  /* Create a Drive, update db, return new Drive data
   *
   *  Drive data {title, description, route_link}
   *  returns {title, description, route_link, created_at}
   *
   *  Throws BadRequestError if route_link is already in db
   */
  static async create({ title, description, route_link }) {
    const duplicateCheck = await db.query(
      "SELECT route_link FROM drives WHERE route_link = $1;",
      [route_link]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError("This route link already exists");
    }

    const res = await db.query(
      `INSERT INTO drives (title, description, route_link, created_at) 
        VALUES ($1, $2, $3, $4) RETURNING title, description, route_link, created_at;`,
      [title, description, route_link, new Date()]
    );
    const drive = res.rows[0];
    return drive;
  }

  /*
   * Return all drives, has optional search filters(title, created_at)
   * will search for titles case-insensitive and partial matches.
   *
   *
   *
   */

  static async getDrives(searchFilter = {}) {
    let query = `SELECT id, title, description, route_link, created_at FROM drives;`;
    // let where = [];
    // let queryvals = [];
    // const { title, created_at } = searchFilter;

    // if (title) {
    //   queryvals.push(`%${title}%`);
    //   where.push(`title ILIKE $${queryvals.length}`);
    // }

    // if (created_at) {
    //   queryvals.push(`%${created_at}%`);
    //   where.push(`created_at = $${queryvals.length}`);
    // }

    // if (where.length > 0) {
    //   query += " WHERE" + where.join(" AND ");
    // }

    // query += " ORDER BY created_at DESC;";
    // const res = await db.query(query, queryvals);
    const res = await db.query(query);
    return res.rows;
  }

  /*If given title of drive, returns data about said drive.*/

  static async getDrive(title) {
    const res = await db.query(
      `SELECT id, title, description, route_link, created_at FROM drives WHERE title = $1`,
      [title]
    );
    const drive = res.rows[0];

    if (!drive) throw new NotFoundError(`No Drive exists with name: ${title}`);

    return drive;
  }

  /* Updates existing drive, not all fields are required, and only changes provided fields.*/

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      description: "description",
      route_link: "route_link",
    });
    const handleIdx = "$" + (values.length + 1);

    const querySql = `UPDATE drives SET ${setCols} WHERE title = ${handleIdx} RETURNING id, title, description, route_link, created_at`;
    const res = await db.query(querySql, [...values, title]);
    const drive = res.rows[0];

    if (!drive)
      throw new BadRequestError(`Drive with title ${title} does not exist`);

    return drive;
  }

  static async remove(title) {
    const res = await db.query(
      `DELETE FROM drives WHERE title = $1 RETURNING title`,
      [title]
    );
    const remDrive = res.rows[0];

    if (!remDrive)
      throw new NotFoundError(`Drive with title ${title} does not exist.`);
  }

  static async joinDrive(username, title) {
    const precheck = await db.query(`SELECT id FROM drives WHERE title = $1`, [
      title,
    ]);
    const drive = precheck.rows;

    if (!drive) throw new NotFoundError("Drive does not exist");

    const precheck2 = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    const user = precheck2.rows[0];

    if (!user) throw new NotFoundError("User not found");

    await db.query(
      `INSERT INTO users_drives (user_id, drive_id) VALUES ($1, $2)`,
      [user, drive]
    );
  }

  static async leaveDrive(username, title) {
    const precheck = await db.query(`SELECT id FROM drives WHERE title = $1`, [
      title,
    ]);
    const drive = precheck.rows[0];

    if (!drive) throw new NotFoundError("Drive does not exist");

    const precheck2 = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    const user = precheck2.rows[0];

    if (!user) throw new NotFoundError("User not found");

    await db.query(
      `DELETE FROM users_drives WHERE user_id = $1 AND drive_id = $2`,
      [user, drive]
    );
  }
}

module.exports = Drive;
