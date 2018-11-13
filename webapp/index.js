'use strict';

//get libraries
const express = require('express');
var cookieParser = require('cookie-parser');
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
// app.use(session(
// 	{
// 	secret:'tung',
// 	resave: true,
// 	saveUninitialized:true
// 	}));
app.use(cookieParser());
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

//get Patient registration page
app.get('/patient', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/Patient.html'));
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
  var address = req.body.address;

  //print variables
  console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' PatientId: ' + PatientId + ' cardId: ' + cardId + 'address' + address + 'dob' +dob);

  //validate Patient registration fields
  validate.validatePatientRegistration(cardId, PatientId, firstName, lastName, email, phoneNumber, dob,address)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
          
        });
        return;
      } else {
        //else register Patient on the network
        network.registerPatient(cardId, PatientId, firstName, lastName, email, phoneNumber , address , dob)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {

            	//register healthRecord
            	network.createHealthRecord(cardId,PatientId,PatientId)
            	.then((response)=>{
            		if(response.error!=null){
            			res.json({
            				error: response.error
            			});
            		}else {
            			              //else return success
		              res.json({
		                success: response
		              });
            		}

            	});

            }
          });
      }
    });


});


//post call to retrieve patient data, transactions data and partners to perform transactions with from the network
app.post('/api/patientData', function(req, res) {

  //declare variables to retrieve from request\
  //console.log(req);
  var accountNumber = req.body.patientid;
  var cardId = req.body.cardid;

  //print variables
  console.log('patientData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get patient data from network
  network.patientData(cardId, accountNumber)
    .then((patient) => {
      //return error if error in response
      if (patient.error != null) {
        res.json({
          error: patient.error
        });
      } else {
        //else add patient data to return object
        returnData.patientId = patient.patientId;
        returnData.firstName = patient.firstName;
        returnData.lastName = patient.lastName;
        returnData.phoneNumber = patient.phoneNumber;
        returnData.email = patient.email;
        returnData.dob = patient.dob;
        returnData.address = patient.address;
        //returnData.points = patient.points;
        // console.log("ok baby");
      }
      //console.log(returnData);
    })
    .then(() => {
      //get healthRecord transactions from the network
      network.healthRecord(cardId,accountNumber)
        .then((healthRecord) => {
          //return error if error in response
          if (healthRecord.error != null) {
            res.json({
              error: healthRecord.error
            });
          } else {
            //else add transaction data to return object
            returnData.healthRecord = healthRecord;
          }
          res.json(returnData);
        });
    });
    //console.log(returnData);
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