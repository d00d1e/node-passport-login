const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

// User model
const User = require('../models/User');

// login page
router.get('/login', (req, res) => {
  res.render('login');
});

// register page
router.get('/register', (req, res) => {
  res.render('register');
})

// register handle
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  let errors = [];

  // check required fields
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // check passwords match
  if(password !== confirmPassword) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // check password length
  if(password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if(errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    });
  } else {
    await User.findOne({ email: email })
      .then(user => {
        if(user) {
          errors.push({ msg: 'Email is already registered' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            confirmPassword
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        // hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                req.flash('success_msg', 'You are now registered! Please log in.')
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;