const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)


const User = require('./models/user');
const Exercise = require('./models/exercise');

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res) => {
  const user = req.body.username;
  console.log("User is " + user);
  const newUser = new User({
      username: user
    });
  
  newUser.save((err, data) => {
      if (err) {
        if (err.code === 11000) {
          res.send('Username already exists, try a different username');
        } else {
          console.error("Error: " + err);
          res.send('Error while creating user.');
        }
      } else {
        console.log("At else");
        console.dir(data)
        res.json(data);
      }
  });
});

app.post('/api/exercise/add', (req, res) => {
  //console.dir(req);
  const userID = req.body.userId;
  if (!userID || userID.length < 1) {
    res.status(500).json({error: "invalid userID"});
  }
  else {
    console.log("Searching for user: " + userID);
    User.findOne({ _id: userID }, function (err, user) {
      if (err) {
        console.error("There was an Error: " + err);
      }
      console.dir(user);
      if (user) {
        console.log("User found!");
        console.dir(user);
        
        const exercise = new Exercise({
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date,
          userId: req.body.userId
        });
        
        exercise.save((err, data) => {
          if (err) {
            res.status(500).send({status: "error", message: err});
          }
          if (data) {
            res.status(200).send({ status: "success" });
          }
        });
        
      }
      else {
        res.status(500).send({status: "error", message: "User not found"});
      }
    
    });
    
  }
});

app.get('/api/exercise/log', (req,res) => {
  console.dir(req);
  Exercise.find({userId: req.query.userId}, function(err, docs) {
     if (docs) {
       console.log("We got docs!");
       console.dir(docs);
       res.send(docs);
     }
  }
)});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
