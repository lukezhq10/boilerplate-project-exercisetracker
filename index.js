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
app.get('/api/users/:_id/logs', async (req, res) => {
  var id = req.params._id;
  var from = req.query.from;
  var to = req.query.to;
  var limit = req.query.limit;


  try {
    var user = await User.findById(id);

    if (!user) {
      console.log('no user found');
      return res.status(400).json({ error: 'no user found' });
    }

    // copy of log to filter based on from, to, limit queries
    var workingLog = user.log;

    // filter exercise log by dates ????????????????????????????????????
    if (from && to) {
      var from = new Date(from);
      var to = new Date(to);
      var filteredLog = workingLog.filter(exercise => {
        console.log("exercise", exercise.date);
        exercise.date >= from && exercise.date <= to
      });
      var workingLog = filteredLog;
    } else {
      // return full user log
      var workingLog = user.log;
    }

    // limit number of exercises returned
    if (limit) {
      var slicedLog = workingLog.slice(0, limit);
      var workingLog = slicedLog;
    }

    // convert log date back to string to fulfill test
    var test = workingLog.map(item => ({
      description: item.description,
      duration: item.duration,
      date: item.date
    }));

    // rebuild exp response
    var exerciseLog = {
      username: user.username,
      _id: user._id,
      count: workingLog.length,
      log: test
    }

    console.log(exerciseLog)
    res.json(exerciseLog);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
})


// test user 642e02bf7207dacb547ebbfb

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});