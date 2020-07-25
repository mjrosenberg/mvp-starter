var express = require('express');
var bodyParser = require('body-parser');
const Promise = require('bluebird');
const hashPassword = require('../database-mongo/hashPassword.js');
// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
// var items = require('../database-mysql');
var classes = require('../database-mongo');

var app = express();

app.use(bodyParser.json());
// UNCOMMENT FOR REACT
app.use(express.static(__dirname + '/../react-client/dist'));

Promise.promisifyAll(require('mongoose'));

app.get('/classes/:subjectName', (req, res) => {
  classes.Class.find({'subject': req.params.subjectName})
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.error(err);
    });
});

app.get('/allClasses', (req, res) => {
  classes.Class.find()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.error(err);
    });
});

app.post('/addStudent/:classId', (req, res) => {
  classes.Class.findOneAndUpdate({_id: req.params.classId}, {$push:{students: req.body}}, {
    new: true
    })
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.error(err);
    });
});

//student routes
app.get('/login/:email/:hashedPassword', (req, res) => {
  classes.Student.find({email: req.params.email})
    .then((data) => {
      console.log('data is', data[0]._doc);
      if (req.params.hashedPassword === data[0]._doc.password){
        res.send({
          firstName: data[0]._doc.firstName,
          lastName: data[0]._doc.lastName,
          email: data[0]._doc.email,
          classes: data[0]._doc.classes
        })
      } else {
        res.status(404).send({error: 'The password you inputted is incorrect, please try a different password'});
      }
    })
    .catch((err) => {
      res.status(404).send({error: 'This user doesn\'t exist, please create an account or sign in with a different email to continue'});
      console.log(err);
    })
});

app.post('/addAccount', (req, res) => {
  classes.Student.insertMany([{
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPassword(req.body.password),
  }])
    .then((data) => {
      res.send('added account');
    })
    .catch((err) => {
      res.send('failed to add account');
      console.log(err);
    })
});

app.listen(3000, function() {
  console.log('listening on port 3000!');
});

