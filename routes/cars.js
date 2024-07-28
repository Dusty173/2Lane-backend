const jsonschema = require("jsonschema");
const express = require("express");
const addCarSchema = require("../schemas/addCar.json");
const updateCarSchema = require("../schemas/updateCar.json");
const { BadRequestError } = require("../expressError");
const {
  ensureCorrectUserOrAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const Car = require("../models/car");

const router = express.Router();

// User route to get a list of users cars.

router.get("/:username", ensureLoggedIn, async (req, res, next) => {
  try {
    const cars = await Car.getAll(req.params.username);
    return res.json({ cars });
  } catch (err) {
    return next(err);
  }
});

// User route for getting a certain car for a user.

router.get("/:username/:carId", ensureLoggedIn, async (req, res, next) => {
  try {
    const car = await Car.getCar(req.params.username, req.params.carId);
    return res.json({ car });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for adding cars for a user.

router.post(
  "/:username/new",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    console.log("RouteFile:", req.params.username, req.body);
    try {
      const validator = jsonschema.validate(req.body, addCarSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const username = req.params.username;
      const data = req.body;
      const car = await Car.add({ username, data });

      return res.status(201).json({ car });
    } catch (err) {
      return next(err);
    }
  }
);

// User/Admin route for deleting a users cars.

router.delete(
  "/:username/:carId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    let username = req.params.username;
    let carId = req.params.carId;
    try {
      await Car.remove({ username, carId });
      const deleted = res.rows;
      return res.json({ deleted });
    } catch (err) {
      return next(err);
    }
  }
);

// User/Admin route to update a car

router.patch(
  "/:username/:carId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, updateCarSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const car = await Car.update(req.params.username, req.params.carId, req.body);
      return res.json({ car });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
