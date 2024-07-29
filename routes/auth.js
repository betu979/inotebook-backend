const express = require('express');
const User = require('../models/User');
const router = express.Router()

// Create a User using: POST "/api/auth/". Doesn't require Auth
router.post('/', (req, res)=>{
    const { name, email, password } = req.body;

  // Create a new user document
  const user = new User({
    name,
    email,
    password
  });

  // Save the user document to MongoDB
  user.save();
    res.send(req.body)
})

module.exports = router