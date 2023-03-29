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

// set up user schema
const userSchema = new mongoose.Schema({
  username: String
})
// set up exercise schema
// set up log schema

// set up user model
const User = mongoose.model('User', userSchema);

// post requests for create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = new User({username});
  return res.json({ 
    username: newUser.username,
    _id: newUser._id
  })
  // return response with json object { username: , _id: }
})

// // post requests for add exercises
// app.post('/api/users/:_id/exercises', (req, res) => {

// })



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
