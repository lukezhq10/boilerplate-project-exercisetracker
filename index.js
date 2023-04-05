const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env['MONGO_URI'];

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// connect to mongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// set up exercise schema
const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
});
// set up user schema
const userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [exerciseSchema]
});
// set up exercise and user model
const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

// POST request for create a new user
app.post('/api/users', async (req, res) => {
  var username = req.body.username;
  var newUser = await User.create({
    username: username,
    count: 0
  });

  // return response with json object { username: , _id: }
  res.json({ 
    username: newUser.username,
    _id: newUser._id
  })
});

// POST request for exercise form
app.post('/api/users/:_id/exercises', async (req, res) => {
  // includes fields description, duration, date (optional - use current date if none)
  var id = req.params._id;
  var description = req.body.description;
  var duration = req.body.duration;
  
  if (!req.body.date) {
    var date = new Date().toDateString();
    var newExercise = await Exercise.create({
      description: description,
      duration: duration,
      date: date
    });
  } else {
    var date = new Date(req.body.date).toDateString(); // local timezone needs to be UTC for test to pass with this
    var newExercise = await Exercise.create({
      description: description,
      duration: duration,
      date: date
    });
  }

  // add exercise into specified user based on _id
  var update = { $push: { log: {
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date 
  } } };

  
  User.findByIdAndUpdate(id, update, { new: true })
    .exec()
    .then(updatedUser => {
      // increase user count by 1 for new exercise added
      console.log({
        username: updatedUser.username,
        _id: updatedUser._id.toString(),
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date
      })
      // return response with updated user object
      res.json({
        username: updatedUser.username,
        _id: updatedUser._id.toString(),
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("Server error");
    });

  // adding an exercise should increase User count +1
  User.findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true })
    .exec()
    .then(updatedUser => {
      console.log({
        count: updatedUser.count,
        log: updatedUser.log
      })
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("Server error");
    });
});

// GET request to get all users in the DB as an array
app.get('/api/users/', (req, res) => {
  // get list of users from DB
  User.find({})
    .exec()
    .then((data) => {
      console.log(data);
      if (data && data.length) {
        // return as an array
        res.json(data);
      } else {
        res.send('no user found');
      }
    })
    .catch((err) => {
      console.error(err);
      return res.json({ error: err });
    });
});

// GET request to retrieve full exercise log of a user
app.get('/api/users/:_id/logs', (req, res) => {
  var id = req.params._id;
  User.findById(id)
  .exec()
  .then((data) => {
    console.log(data);
    if (data) {
      console.log(data);
      res.json(data);
    } else {
      res.send('no user found');
    }
  })
  .catch((err) => {
    console.error(err);
    return res.json({ error: err });
  });
})

// from, to, and limit parameters to retrieve part of the log from a user



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
