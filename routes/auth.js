const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'abhitheboss'
let success = false
// Route 1: Create a User using: POST "/api/auth/createuser". Doesn't require Auth
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
      return res.status(400).json({success, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry a user with this email already exist" });
      }

      const salt = await bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hashSync(password, salt);


      // Create a new user
      user = await User.create({
        name: name,
        email: email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET)
      success = true
      res.json({success, authtoken});
    } catch (error) {
      console.error(success, error.message);
      res.status(500).send("Internal Server Error")
    }
  }
);

// Route 3: Authenticate a user using: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email"),
    check("password").exists().withMessage("Password can not be blank"),
  ],
  async (req, res) => {

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({success, errors: errors.array()})
    }

    const {email, password} = req.body
    try{
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({success, errors: "Please try to login with correct credentials"})
      }

      const passwordCompare = await bcrypt.compare(password, user.password)
      if(!passwordCompare){
        return res.status(400).json({success, errors: "Please try to login with correct credentials"})
      }

      const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET)
      success = true
      res.json({success, authtoken})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error")
    }
  }
)


// Route 3: Get a loggedin User Details using: POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
  try{
    const userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error){
    console.error(error.message)
    res.status(500).send("Internal Server Error")
  }
})


module.exports = router;
