"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const Post = require("../models/posts");
const createPostSchema = require("../schemas/createPost.json");
const updatePostSchema = require("../schemas/updatePost.json");
const db = require("../db");

const router = express.Router();

// User route for getting list of posts
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.getAll();
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for creating a post

router.post("/new", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, createPostSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const post = Post.create(req.body);
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

// User route to get a specific post
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.get(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

// User/Admin route to update a post

router.patch("/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, updatePostSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const post = await Post.update(req.params.id, req.params.body);
    return res.json(post);
  } catch (err) {
    return next(err);
  }
});

// User/Admin route for removing a post

router.delete("/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    await Post.remove(req.params.id, req.body.user_id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
