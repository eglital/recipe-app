const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const models = require("./../models");
const User = mongoose.model("User");
const Recipe = mongoose.model("Recipe");
const { loggedInOnly, loggedOutOnly } = require("../helpers/sessions");

router.get("/add", loggedInOnly, (req, res) => {
  res.render("addRecipe");
});

router.post("/add", loggedInOnly, (req, res) => {
  const {
    owner,
    name,
    ingredients,
    recipeYield,
    instructions,
    image,
    url
  } = req.body;
  var newRecipe = new Recipe({
    owner,
    name,
    ingredients: ingredients.split("; "),
    recipeYield,
    instructions,
    image,
    url
  });
  newRecipe
    .save()
    .then(recipe => {
      res.redirect("/");
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/edit/:id", loggedInOnly, (req, res) => {
  let recipeId = req.params.id;
  Recipe.findById(recipeId)
    .then(recipe => {
      if (req.user._id.toString() !== recipe.owner.toString()) {
        res.redirect("/");
      } else {
        recipe.ingredients = recipe.ingredients.join("; ");
        res.render("editRecipe", { recipe });
      }
    })
    .catch(e => res.status(500).send(e.stack));
});

router.put("/edit/:id", (req, res) => {
  var { name, ingredients, recipeYield, instructions, image, url } = req.body;
  ingredients = ingredients.split("; ");
  Recipe.findByIdAndUpdate(req.params.id, {
    name,
    ingredients,
    recipeYield,
    image,
    url
  })
    .then(() => {
      req.method = "GET";
      res.redirect("back");
    })
    .catch(e => res.status(500).send(e.stack));
});

router.delete("/:id", (req, res) => {
  Recipe.findByIdAndRemove(req.params.id)
    .then(() => {
      req.method = "GET";
      res.redirect("back");
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/my", loggedInOnly, (req, res) => {
  res.locals.currentUser.my = true;
  Recipe.find({ owner: req.user._id })
    .populate("owner")
    .sort({ createdAt: "desc" })
    .then(recipes => {
      res.render("home", { recipes });
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/report/:id", loggedInOnly, (req, res) => {
  Recipe.findByIdAndUpdate(req.params.id, {
    $push: { reportedBy: req.user._id }
  })
    .then(() => {
      res.redirect("/");
    })
    .catch(e => res.status(500).send(e.stack));
});

module.exports = router;
