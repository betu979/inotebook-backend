const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Create a User using: POST "/api/auth/createuser". Doesn't require Auth
router.post(
  "/createuser",
  [
    check("name")
      .isLength({ min: 3, max: 50 })
      .withMessage("Name must be between 3 and 50 characters"),
    check("email").isEmail().withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 5, max: 128 })
      .withMessage("Password must be between 8 and 128 characters"),
  ],
  async (req, res) => {
    // If there are errors return bad request and the errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exist" });
      }
      // Create a new user
      user = await User.create({
        name: name,
        email: email,
        password: password,
      });
      //   .then((user) => {
      //     console.log(`User created: ${user}`);
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured")
    }
  }
);

module.exports = router;
