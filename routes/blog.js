const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function async(req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find()
    .project({ title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.post("/posts", async (req, res) => {
  const authorId = new ObjectId(req.body.author);
  const [author] = await db
    .getDb()
    .collection("authors")
    .find({ _id: authorId })
    .toArray();
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
    humanDate: new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  res.redirect("/posts");
});

router.get("/posts/:id", async (req, res, next) => {
  let postId;
  try {
    postId = new ObjectId(req.params.id);
  } catch (error) {
    return next(error);
  }
  const [postData] = await db
    .getDb()
    .collection("posts")
    .find({ _id: postId })
    .toArray();

  if (!postData) {
    return res.render("404");
  }
  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  const [postData] = await db
    .getDb()
    .collection("posts")
    .find({ _id: postId })
    .project({ title: 1, summary: 1, body: 1 })
    .toArray();
  res.render("update-post", { post: postData });
});

router.post("/posts/:id/edit", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
        },
      }
    );
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  await db.getDb().collection("posts").deleteOne({ _id: postId });
  res.redirect("/posts");
});

module.exports = router;
