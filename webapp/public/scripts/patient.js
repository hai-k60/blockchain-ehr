//var signIn = require('./network/network.js');

var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-patient').click(function() {
  updateMember();
});

function updateMember() {

  //get user input data
  var formAccountNum = $('.patient-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"patientid" : "' + formAccountNum + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'patientData',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {
      console.log(data);
      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {

        //update heading
        $('.heading').html(function() {
          var str = '<h2><b>' + data.firstName + ' ' + data.lastName + '</b></h2>';
          str = str + '<h2><b>' + data.patientId + '</b></h2>';
          //str = str + '<h2><b>' + data.points + '</b></h2>';

          return str;
        });
        // $(document).ready(function(){
        //   $("#nameOfPatient").val(data.firstName);
        // });
        //view information patient
        $('.dashboards').html(function() {
          
          var str = '<b style="color:red;">Name: </b>' + data.firstName + ' ' + data.lastName +'<br>';
          str = str + '<b style="color:red;">Identifed: </b> ' + data.patientId +'<br>';
          str = str + '<b style="color:red;">Email: </b>' + data.email +'<br>';
          str = str + '<b style="color:red;">phoneNumber: </b>' + data.phoneNumber +'<br>';
          str = str + '<b style="color:red;">Date Of Birth: </b>' + data.dob +'<br>';
          str = str + '<b style="color:red;">Address: </b>' + data.address +'<br>';
          //str = str + '<h2><b>' + data.points + '</b></h2>';
          return str;
        });

        //document.getElementById('healthRecord').value = data.healthRecord[0].recordId;
        $('.healthRecord-id').html(function(){
          $('input[name="healthRecord-id"]').val(data.healthRecord[0].recordId);
        });

        $('.healthRecord').html(function() {
          var str =  '<b style="color:red;">Identifed: </b> ' + data.healthRecord[0].recordId +'<br>';
          str = str + '<b style="color:red;">Temperature: </b>' + data.healthRecord[0].temperature +' °C<br>';
          str = str + '<b style="color:red;">Blood Pressure: </b>' + data.healthRecord[0].bloodPressure +' mm / Hg <br>';
          
          let doctorauthorisedDoctors = data.healthRecord[0].authorisedDoctors;
          if(doctorauthorisedDoctors.length!=0){
            str = str + '<b style="color:red;">Authorised Doctors: </b>';
            for (var i = 0; i < doctorauthorisedDoctors.length; i++) {
              let datarevoke=doctorauthorisedDoctors[i].split("#")[1];
              str = str +  ' Doctors: ' + datarevoke ;
            }
            str =str + '<br>';
          }

          return str;
        });

        
        $('.revokeAccess-doctor select').html(function() {
          var str = '<option value="" disabled="" selected="">select</option>';
          var doctorauthorisedDoctors = data.healthRecord[0].authorisedDoctors;
          for (var i = 0; i < doctorauthorisedDoctors.length; i++) {
            let datarevoke=doctorauthorisedDoctors[i].split("#")[1];
            str = str + '<option doctor-revoke-id=' + datarevoke + '> ' + datarevoke + '</option>';
          }
          return str;
        });

        getAllDoctorAccess(formCardId);

        //remove login section and display member page
        document.getElementById('loginSection').style.display = "none";
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {

    }
  });
}


$('.submit-grant-doctor').click(function(){
  GrantAccessHr();
});


function GrantAccessHr(){
  // var formAccountNum = $('.patient-id input').val();
  var formCardId = $('.card-id input').val();
  var formHealthRecordId = $('.healthRecord-id input').val();
  var formDoctorId = $('.grantAccess-doctor select').find(":selected").attr('doctor-grant-id');
  var inputData = '{' +'"healthRecordId" : "' + formHealthRecordId + '", '+ '"cardid" : "' + formCardId + '", ' +  '"doctorid" : "' + formDoctorId + '"}';
  console.log(inputData);
  $.ajax({
    type: 'POST',
    url: apiUrl + 'grantAccessHr',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
    },
    success: function(data) {

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        //update member page and notify successful transaction
        updateMember();
        console.log('Transaction successful');
        alert('Transaction successful');
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {}
  }); 

}

$('.submit-revoke-doctor').click(function(){
  RevokeAccessHr();
});

function RevokeAccessHr(){
  // var formAccountNum = $('.patient-id input').val();
  var formCardId = $('.card-id input').val();
  var formHealthRecordId = $('.healthRecord-id input').val();
  var formDoctorId = $('.revokeAccess-doctor select').find(":selected").attr('doctor-revoke-id');
  var inputData = '{' +'"healthRecordId" : "' + formHealthRecordId + '", '+ '"cardid" : "' + formCardId + '", ' +  '"doctorid" : "' + formDoctorId + '"}';
  console.log(inputData);
  $.ajax({
    type: 'POST',
    url: apiUrl + 'revokeAccessHr',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
    },
    success: function(data) {

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        //update member page and notify successful transaction
        updateMember();
        console.log('Transaction successful');
        alert('Transaction successful');
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {}
  }); 

}


function getAllDoctorAccess(cardid){
  var inputData= '{' + '"cardid" : "' + cardid +'"}';
  console.log(inputData);
  $.ajax({
    type: 'POST',
    url: apiUrl + 'getAllDoctor',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
    },
    success: function(data) {

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {

        //console.log(data.doctor[0].doctorId);
        //update all doctor dropdown for transaction
        $('.grantAccess-doctor select').html(function() {
          var str = '<option value="" disabled="" selected="">select</option>';
          var doctorData = data.doctor;
          for (var i = 0; i < doctorData.length; i++) {
            str = str + '<option doctor-grant-id=' + doctorData[i].doctorId + '> ' + doctorData[i].doctorId + '</option>';
          }
          return str;
        });
        //update member page and notify successful transaction
        //updateMember();
        // alert('Transaction successful');
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {}
  });
}

$('.submit-update-healthRecord').click(function(){
  updateHealthRecord();
});

function updateHealthRecord(){
  var formCardId = $('.card-id input').val();
  var formHealthRecordId = $('.healthRecord-id input').val();
  var formTemp = $('#update-temperature').val();
  var formBP = $("#update-bloodPressure").val();//$('#update-bloodPressure').find('input[name="update-bloodPressure"]').val();
  var inputData ='{' +'"recordId" : "' + formHealthRecordId + '", '+'"temperature" : "' + formTemp + '", '+ '"cardid" : "' + formCardId + '", ' +  '"bloodPressure" : "' + formBP + '"}';
  console.log(inputData);

  $.ajax({
    type: 'POST',
    url: apiUrl + 'updateHealthRecord',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
    },
    success: function(data) {

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        //update member page and notify successful transaction
        updateMember();
        //console.log('Transaction successful');
        $('#myModalclose').trigger('click');
        alert('Transaction successful');
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {}
  }); 

}


