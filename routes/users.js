"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureCorrectUserOrAdmin,
  ensureAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const User = require("../models/user");
const { createToken } = require("../helpers/token");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

// Admin POST route for adding Users.

router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

// Admin GET route for retrieving a list of all Users

router.get("/", ensureAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for getting a User

router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route to Edit a User

router.patch("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.updateUser(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for removing a User

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      await User.removeUser(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

// User/Admin route for getting a list of drives a User is on.

router.get(
  "/:username/drives",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const user = await User.getDrives(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

// User/Admin route for getting a list of User cars

router.get(
  "/:username/mygarage",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const user = await User.getCars(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

// User/Admin route for getting a list of User Posts

router.get(
  "/:username/posts",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const user = await User.getPosts(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

// User route for joining a Drive

router.post("/:username/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const driveId = +req.params.id;
    await User.joinDrive(req.params.username, driveId);
    return res.json({ joined: driveId });
  } catch (err) {
    return next(err);
  }
});

// User route for leaving a Drive

router.delete("/:username/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const driveId = +req.params.id;
    await User.leaveDrive(req.params.username, driveId);
    return res.json({ left: driveId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
