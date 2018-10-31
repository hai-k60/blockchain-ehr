'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path')

//create express web-app
const app = express();
const router = express.Router();

//get the libraries to call
var network = require('./network/network.js');
var validate = require('./network/validate.js');
var analysis = require('./network/analysis.js');

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());

//get home page
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get Patient registration page
app.get('/registerPatient', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerPatient.html'));
});


//post call to register Patient on the network
app.post('/api/registerPatient', function(req, res) {

  //declare variables to retrieve from request
  var PatientId = req.body.PatientId;
  var cardId = req.body.cardid;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var phoneNumber = req.body.phonenumber;
  var dob = req.body.dob;
  var adress = req.body.adress;

  //print variables
  console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' PatientId: ' + PatientId + ' cardId: ' + cardId + 'adress' + adress + 'dob' +dob);

  //validate Patient registration fields
  validate.validatePatientRegistration(cardId, PatientId, firstName, lastName, email, phoneNumber, adress , dob)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
          
        });
        return;
      } else {
        //else register Patient on the network
        network.registerPatient(cardId, PatientId, firstName, lastName, email, phoneNumber , adress , dob)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });


});



//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function() {
  console.log('web app running on port: %d', port);
});