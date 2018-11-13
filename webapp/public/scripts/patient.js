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

        $('.healthRecord').html(function() {
          
          
          var str =  '<b style="color:red;">Identifed: </b> ' + data.healthRecord[0].recordId +'<br>';
          str = str + '<b style="color:red;">Temperature: </b>' + data.healthRecord[0].temperature +' °C<br>';
          str = str + '<b style="color:red;">Blood Pressure: </b>' + data.healthRecord[0].bloodPressure +' mm / Hg <br>';
          // str = str + '<b>Date Of Birth: </b>' + data.dob +'<br>';
          // str = str + '<b>Address: </b>' + data.address +'<br>';
          //str = str + '<h2><b>' + data.points + '</b></h2>';
          return str;
        });



        //update partners dropdown for earn points transaction
        // $('.earn-partner select').html(function() {
        //   var str = '<option value="" disabled="" selected="">select</option>';
        //   var partnersData = data.partnersData;
        //   for (var i = 0; i < partnersData.length; i++) {
        //     str = str + '<option partner-id=' + partnersData[i].id + '> ' + partnersData[i].name + '</option>';
        //   }
        //   return str;
        // });

        //update partners dropdown for use points transaction
        // $('.use-partner select').html(function() {
        //   var str = '<option value="" disabled="" selected="">select</option>';
        //   var partnersData = data.partnersData;
        //   for (var i = 0; i < partnersData.length; i++) {
        //     str = str + '<option partner-id=' + partnersData[i].id + '> ' + partnersData[i].name + '</option>';
        //   }
        //   return str;
        // });

        //update earn points transaction
        // $('.points-allocated-transactions').html(function() {
        //   var str = '';
        //   var transactionData = data.earnPointsResult;

        //   for (var i = 0; i < transactionData.length; i++) {
        //     str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />partner: ' + transactionData[i].partner + '<br />member: ' + transactionData[i].member + '<br />points: ' + transactionData[i].points + '<br />transactionName: ' + transactionData[i].$class + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
        //   }
        //   return str;
        // });

        // //update use points transaction
        // $('.points-redeemed-transactions').html(function() {
        //   var str = '';

        //   var transactionData = data.usePointsResults;

        //   for (var i = 0; i < transactionData.length; i++) {
        //     str = str + '<p>timeStamp: ' + transactionData[i].timestamp + '<br />partner: ' + transactionData[i].partner + '<br />member: ' + transactionData[i].member + '<br />points: ' + transactionData[i].points + '<br />transactionName: ' + transactionData[i].$class + '<br />transactionID: ' + transactionData[i].transactionId + '</p><br>';
        //   }
        //   return str;
        // });

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



function usePoints(formPoints) {

  //get user input data
  var formAccountNum = $('.account-number input').val();
  var formCardId = $('.card-id input').val();
  var formPartnerId = $('.use-partner select').find(":selected").attr('partner-id');

  //create json data
  var inputData = '{' + '"accountnumber" : "' + formAccountNum + '", ' + '"cardid" : "' + formCardId + '", ' + '"points" : "' + formPoints + '", ' + '"partnerid" : "' + formPartnerId + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'usePoints',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
      document.getElementById('infoSection').style.display = "none";
    },
    success: function(data) {

      document.getElementById('loader').style.display = "none";
      document.getElementById('infoSection').style.display = "block";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {
        //update member page and notify successful transaction
        updateMember();
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
