const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

//declate namespace
const namespace = 'org.lms.ehr';

//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
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

  /*
  * Create patient participant and import card for identity
  * @param {String} cardId Import card id for patient
  * @param {String} accountNumber patient account number as identifier on network
  * @param {String} firstName patient first name
  * @param {String} lastName patient last name
  * @param {String} phoneNumber patient phone number
  * @param {String} dob patient dob
  */
 registerPatient: async function (cardId, patientID,firstName, lastName, dob, address) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@ehr');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create patient participant
      const patient = factory.newResource(namespace, 'Partient', patientID);
      patient.firstName = firstName;
      patient.lastName = lastName;
      patient.dob = dob;
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
   registerLab: async function (cardId, labID,name, address) {
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
  * Create Clinician participant and import card for identity
  * @param {String} cardId Import card id for Clinician
  * @param {String} ClinicianId Clinician Id as identifier on network
  * @param {String} name Clinician name
  */
  registerClinician: async function (cardId, clinicianId, firstname,lastName,specialisation,address) {

    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@ehr');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create Clinician participant
      const Clinician = factory.newResource(namespace, 'Clinician', clinicianId);
      Clinician.firstname = firstname;
      Clinician.lastName=lastName;
      Clinician.Specialisation=specialisation;
      Clinician.address=address;

      //add Clinician participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Clinician');
      await participantRegistry.add(Clinician);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Clinician#' + clinicianId, cardId);

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
  createHealthRecord: async function(cardId,recordId, temperature, bloodPressure, ownerId, doctorId){
    try{
      //connect as client via cardId
      businessNetworkConnection= new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);
      //get the factory for the business network.
      factory= businessNetworkConnection.getBusinessNetwork().getFactory();
      //create healthRecord asset
      const HealthRecord = factory.newResource(namespace, 'HealthRecord', recordId);
      HealthRecord.temperature = temperature;
      HealthRecord.bloodPressure = bloodPressure;
      HealthRecord.owner = factory.newRelationship(namespace, 'Patient', ownerId);
      HealthRecord.doctor = factory.newRelationship(namespace, 'Doctor', doctorId);

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
  * @param {String} ClinicianId Clinician Id of Clinician
  * @param {Integer} points Points value
  */
  earnPointsTransaction: async function (cardId, accountNumber, ClinicianId, points) {

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
      earnPoints.Clinician = factory.newRelationship(namespace, 'Clinician', ClinicianId);

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
  * @param {String} ClinicianId Clinician Id of Clinician
  * @param {Integer} points Points value
  */
  usePointsTransaction: async function (cardId, accountNumber, ClinicianId, points) {

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
      usePoints.Clinician = factory.newRelationship(namespace, 'Clinician', ClinicianId);

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
  * Get Clinician data
  * @param {String} cardId Card id to connect to network
  * @param {String} ClinicianId Clinician Id of Clinician
  */
  ClinicianData: async function (cardId, ClinicianId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get patient from the network
      const ClinicianRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Clinician');
      const Clinician = await ClinicianRegistry.get(ClinicianId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return Clinician object
      return Clinician;
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
  * Get all Clinicians data
  * @param {String} cardId Card id to connect to network
  */
  allCliniciansInfo : async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query all Clinicians from the network
      const allClinicians = await businessNetworkConnection.query('selectClinicians');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return allClinicians object
      return allClinicians;
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
