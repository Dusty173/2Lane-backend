"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const Drive = require("../models/drive");

const createDriveSchema = require("../schemas/createDrive.json");
const updateDriveSchema = require("../schemas/createDrive.json");
const searchDriveSchema = require("../schemas/searchDrive.json");
const router = express.Router();

// User route for getting a list of Drives

router.get("/", ensureLoggedIn, async (req, res, next) => {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, searchDriveSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const drives = await Drive.getDrives(q);
    return res.json({ drives });
  } catch (err) {
    return next(err);
  }
});

// User route for getting a certain drive

router.get("/:title", ensureLoggedIn, async (req, res, next) => {
  try {
    const drive = await Drive.getDrive(req.params.title);
    return res.json({ drive });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for updating a drive, only if user created this drive.

router.patch("/:title", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, updateDriveSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const drive = await Drive.update(req.params.title, req.body);
    return res.json({ drive });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for removing a Drive

router.delete("/:title", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    await Drive.remove(req.params.title);
    return res.json({ deleted: req.params.title });
  } catch (err) {
    return next(err);
  }
});

// User Route for creating a drive

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, createDriveSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const drive = await Drive.create(req.body);
    return res.json(drive);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
