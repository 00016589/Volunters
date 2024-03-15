const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require('fs');

// Image upload configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Route to add a new user into the database
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user.save()
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'User added successfully!',
      };
      res.redirect("/");
    })
    .catch(err => {
      res.json({ message: err.message, type: 'danger' });
    });
});

// Route to get all users
router.get("/", (req, res) => {
  User.find()
    .then(users => {
      res.render('index', {
        title: 'Home Page',
        users: users
      });
    })
    .catch(err => {
      res.json({ message: err.message });
    });
});

// Route to render form to add a new user
router.get("/add", (req, res) => {
  res.render('add_users', { title: "Add User" });
});

// Route to edit an existing user
router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let user = await User.findById(id).exec();
    if (!user) {
      res.redirect("/");
    } else {
      res.render("edit_users", {
        title: "Edit User",
        user: user,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Update user route
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';
  
    if (req.file) {
      new_image = req.file.filename;
      try {
        await fs.promises.unlink(`./uploads/${req.body.old_image}`);
      } catch (err) {
        console.log(err);
      }
    } else {
      new_image = req.body.old_image;
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name: req.body.name, email: req.body.email, phone: req.body.phone, image: new_image },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.json({ message: "User not found", type: 'danger' });
      }
  
      req.session.message = {
        type: 'success',
        message: 'User updated successfully!',
      };
      res.redirect('/');
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  });
  router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
      const result = await User.findByIdAndDelete(id);
      if (result && result.image) {
        await fs.promises.unlink(`./uploads/${result.image}`);
      }
      req.session.message = {
        type: "info",
        message: "User deleted successfully!",
      };
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.json({ message: err.message });
    }
  });
  
  


module.exports = router;
