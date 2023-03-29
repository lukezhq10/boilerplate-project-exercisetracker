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
  var newUser = new User({username});

  try {
    // save new user to DB
    await newUser.save();

    // return response with json object { username: , _id: }
    return res.json({ 
      username: newUser.username,
      _id: newUser._id
    });
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
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

// POST request for exercise form
app.post('/api/users/:_id/exercises', (req, res) => {
  // includes fields description, duration, date (optional - use current date if none)
  var id = req.body._id;
  var description = req.body.description;
  var duration = req.body.duration;
  
  if (!req.body.date) {
    var date = new Date().toDateString();
    var newExercise = new Exercise({description, duration, date});
  } else {
    var date = req.body.date;
    var newExercise = new Exercise({description, duration, date});
  }

  

  
  // // add exercise into specified user based on _id
  // User.findByIdAndUpdate(id, update)
  // // return res.json(new user object with exercise added)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
