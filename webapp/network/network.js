const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

//declate namespace
const namespace = 'org.lms.ehr';
// var window.a=1;
//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connectionProfilection the tests will use.
let businessNetworkConnection;

let businessNetworkName = 'ehr';
let factory;


/*
 * Import card for an identity
 * @param {String} cardName The card name to use for this identity
 * @param {Object} identity The identity details
 */
async function importCardForIdentity(cardName, identity) {

  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = 'ehr';

  //declare metadata
  const metadata = {
      userName: identity.userID,
      version: 1,
      enrollmentSecret: identity.userSecret,
      businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
 const connectionProfile = require('./local_connection.json');
  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}


/*
* Reconnect using a different identity
* @param {String} cardName The identity to use
*/
async function useIdentity(cardName) {

  //disconnect existing connection
  await businessNetworkConnection.disconnect();

  //connect to network using cardName
  businessNetworkConnection = new BusinessNetworkConnection();
  await businessNetworkConnection.connect(cardName);
}


//export module
module.exports = {
  loginCard:async function(cardId){
    try{
      await useIdentity(cardName);
    }catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }
  },
  /*
  * Create patient participant and import card for identity
  * @param {String} cardId Import card id for patient
  * @param {String} accountNumber patient account number as identifier on network
  * @param {String} firstName patient first name
  * @param {String} lastName patient last name
  * @param {String} phoneNumber patient phone number
  * @param {String} dob patient dob
  */
 registerPatient: async function (cardId, patientID,firstName, lastName, email , phoneNumber,dob, address) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@ehr');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create patient participant
      const patient = factory.newResource(namespace, 'Patient', patientID);
      patient.firstName = firstName;
      patient.lastName = lastName;
      patient.dob = dob;
      patient.email=email;
      patient.phoneNumber=phoneNumber;
      patient.address = address;
      // patient.points = 0;

      //add patient participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Patient');
      await participantRegistry.add(patient);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Patient#' + patientID, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@ehr');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },
   registerLab: async function (cardId, labID,name, address,email) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@ehr');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create patient participant
      const lab = factory.newResource(namespace, 'Lab', labID);
      lab.name = name;
      lab.address = address;
      lab.email=email;
      lab.myPatients=[];
      // patient.points = 0;

      //add patient participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Lab');
      await participantRegistry.add(lab);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Lab#' + labID, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@ehr');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Create Doctor participant and import card for identity
  * @param {String} cardId Import card id for Doctor
  * @param {String} DoctorId Doctor Id as identifier on network
  * @param {String} name Doctor name
  */
  registerDoctor: async function (cardId, DoctorId, firstname,lastName,specialisation,address) {

    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@ehr');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create Doctor participant
      const Doctor = factory.newResource(namespace, 'Doctor', DoctorId);
      Doctor.firstname = firstname;
      Doctor.lastName=lastName;
      Doctor.Specialisation=specialisation;
      Doctor.address=address;
      Doctor.myPatients=[];

      //add Doctor participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Doctor');
      await participantRegistry.add(Doctor);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Doctor#' + DoctorId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@ehr');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },
    /*
  * Create HealthRecord asset 
  * @param {String} cardId Card id to connect to network
  * @param {String} recordeId 
  * @param {String} temperature
  * @param {String} bloodPressure
  * @param {String} ownerId
  * @param {String} doctorId
  */
  createHealthRecord: async function(cardId,recordId, ownerId,){
    try{
      //connect as client via cardId
      businessNetworkConnection= new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);
      //get the factory for the business network.
      factory= businessNetworkConnection.getBusinessNetwork().getFactory();
      //create healthRecord asset
      const HealthRecord = factory.newResource(namespace, 'HealthRecord', recordId);
      HealthRecord.temperature = '';
      HealthRecord.bloodPressure = '';
      HealthRecord.owner = factory.newRelationship(namespace, 'Patient', ownerId);
      
      HealthRecord.authorisedDoctors = [];//factory.newRelationship(namespace,'Doctor', '000001');//factory.newRelationship(namespace, 'Doctor',[]);
      //console.log(HealthRecord.authorisedDoctors);
       HealthRecord.authorisedLabs = [];//factory.newRelationship(namespace,'Lab',[]);
      //add Health Record asset
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace+ '.HealthRecord');
      await assetRegistry.add(HealthRecord);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);
      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }
  }
  ,
  /*
  * Perform GrantAccessToLabHr transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} recordId identified of HealthRecord
  * @param {String} labId identified of Lab
  */
  grantAccessToLabHrTransaction: async function(cardId, recordId, labId){
      try{
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //creat transaction
      const grantaccesstoLab= factory.newTransaction(namespace, 'GrantAccessToLabHr');
      grantaccesstoLab.addThislab= factory.newRelationship(namespace, 'Lab', labId);
      grantaccesstoLab.HealthRecord= factory.newRelationship(namespace, 'HealthRecord', recordId);

      //submit transaction
      await businessNetworkConnection.submitTransaction(grantaccesstoLab);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);
      return true;

      }catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Perform EarnPoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of patient
  * @param {String} DoctorId Doctor Id of Doctor
  * @param {Integer} points Points value
  */
  earnPointsTransaction: async function (cardId, accountNumber, DoctorId, points) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create transaction
      const earnPoints = factory.newTransaction(namespace, 'EarnPoints');
      earnPoints.points = points;
      earnPoints.patient = factory.newRelationship(namespace, 'patient', accountNumber);
      earnPoints.Doctor = factory.newRelationship(namespace, 'Doctor', DoctorId);

      //submit transaction
      await businessNetworkConnection.submitTransaction(earnPoints);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Perform UsePoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of patient
  * @param {String} DoctorId Doctor Id of Doctor
  * @param {Integer} points Points value
  */
  usePointsTransaction: async function (cardId, accountNumber, DoctorId, points) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create transaction
      const usePoints = factory.newTransaction(namespace, 'UsePoints');
      usePoints.points = points;
      usePoints.patient = factory.newRelationship(namespace, 'patient', accountNumber);
      usePoints.Doctor = factory.newRelationship(namespace, 'Doctor', DoctorId);

      //submit transaction
      await businessNetworkConnection.submitTransaction(usePoints);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
    /*
  * Get healthRecord data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of patient
  */
  healthRecord: async function (cardId, accountNumber) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get patient from the network
      const patientRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.patient');
      const patient = await patientRegistry.get(accountNumber);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return patient object
      return patient;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Get patient data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of patient
  */
  patientData: async function (cardId, accountNumber) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get patient from the network
      const patientRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.patient');
      const patient = await patientRegistry.get(accountNumber);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return patient object
      return patient;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Get Doctor data
  * @param {String} cardId Card id to connect to network
  * @param {String} DoctorId Doctor Id of Doctor
  */
  DoctorData: async function (cardId, DoctorId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get patient from the network
      const DoctorRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Doctor');
      const Doctor = await DoctorRegistry.get(DoctorId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return Doctor object
      return Doctor;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get all Doctors data
  * @param {String} cardId Card id to connect to network
  */
  allDoctorsInfo : async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query all Doctors from the network
      const allDoctors = await businessNetworkConnection.query('selectDoctors');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return allDoctors object
      return allDoctors;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }
  },

  /*
  * Get all EarnPoints transactions data
  * @param {String} cardId Card id to connect to network
  */
  earnPointsTransactionsInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query EarnPoints transactions on the network
      const earnPointsResults = await businessNetworkConnection.query('selectEarnPoints');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return earnPointsResults object
      return earnPointsResults;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get all UsePoints transactions data
  * @param {String} cardId Card id to connect to network
  */
  usePointsTransactionsInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query UsePoints transactions on the network
      const usePointsResults = await businessNetworkConnection.query('selectUsePoints');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return usePointsResults;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  }

}
