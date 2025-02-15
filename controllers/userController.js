const Exercise = require('../models/exercise');
const User = require('../models/user');
// get_exercise_log

const add_user = async (req, res) => {
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
  };

const get_users = (req, res) => {
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
  };

const add_exercise = async (req, res) => {
    // includes fields description, duration, date (optional - use current date if none)
    var id = req.params._id;
    var description = req.body.description;
    var duration = req.body.duration;
    
    if (!req.body.date) {
      var date = new Date();
      var newExercise = await Exercise.create({
        description: description,
        duration: duration,
        date: date
      });
    } else {
      var date = new Date(req.body.date); // local timezone needs to be UTC for test to pass with this
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
          date: newExercise.date.toDateString()
        })
        // return response with updated user object
        res.json({
          username: updatedUser.username,
          _id: updatedUser._id.toString(),
          description: newExercise.description,
          duration: newExercise.duration,
          date: newExercise.date.toDateString()
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
  };

const get_exercise_log = async (req, res) => {
    var id = req.params._id;
    var from = req.query.from;
    var to = req.query.to;
    var limit = req.query.limit;
  
    try {
      var user = await User.findById(id);
  
      if (!user) {
        console.log('no user found');
        return res.status(400).json({ error: 'no user found' });
      } else {
      var workingLog = user.log;  // copy of log to filter based on from, to, limit queries
  
      // filter exercise log by from & to dates
      if (from && to) {
        var from = new Date(from);
        var to = new Date(to);
        var filteredLog = workingLog.filter(exercise => {
          let exerciseDate = new Date(exercise.date);
          console.log("exercise", exerciseDate, "from", from, "to", to);
          return exerciseDate >= from && exerciseDate <= to
        });
        var workingLog = filteredLog;
      } else {
        var workingLog = user.log;         // return full user log
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
        date: item.date.toDateString()
      }));
  
      // rebuild expected response
      var exerciseLog = {
        username: user.username,
        _id: user._id,
        count: workingLog.length,
        log: test
      }
  
      console.log(exerciseLog)
      res.json(exerciseLog);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "server error" });
    }
  };

module.exports = {
    add_user,
    get_users,
    add_exercise,
    get_exercise_log
}