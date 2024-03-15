const express = require("express");
const router = express.Router();
const User=require("../models/users");
const multer = require("multer");

// image upload
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
// Insert a new user into database route
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
        res.json({message: err.message, type: 'danger'});
    });
});

// Get all users route
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
  

router.get("/", (req, res) => {
User.find().exec((err, users))
});
router.get("/add", (req, res) => {
    res.render('add_users',{title: "Add User" } );
   });
   
module.exports = router;
