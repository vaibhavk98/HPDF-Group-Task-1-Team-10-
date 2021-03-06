var express = require('express');
var session = require('express-session');
var http = require('http');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port  = 8080;//<----- Control the port no from here
var server = require('http').Server(app);// needed to deploy on server
var fetchAction =  require('node-fetch');
var randomInt = require('random-int');
var fs = require('fs');

// Express server
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

global.n = 10 + randomInt(2 , 1000); 

// Postgress SQL acess linkd

var url_data = "https://data.dankness95.hasura-app.io/v1/query";

var requestOptions = {
	"method": "POST",
    "headers": {
        "Content-Type": "application/json"
    }
};

var H_id = {
    "auth_token": "bb6ad8c1638ea501db12fca4acbd76e3665e5c45ec315914",
    "username": "default",
    "hasura_id": 33,
    "hasura_roles": [
        "user"
    ]
}; // for storing Hasura Id
// Fire Base Setup
/*
// --------------------------------------------------------------------------------------------
var admin = require('firebase-admin');
var serviceAccount = require('./hasura-custom-notification-firebase-adminsdk-f4kqo-b6d8c6ce91.json');
var FCM = require('fcm-push');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hasura-custom-notification.firebaseio.com"
});

var serverKey = 'AAAAi2yKNEQ:APA91bHATD7JYj1Ja9XBGZY3V9y3Hgkk0azgm98y9ujRYcuu4kVyS1NQSSznpb_ZLQTXLUokWP0DkMrmfCMl1YHRU1isSiV5o8JHZXL9sCkeZmZ53j7GBOlFvR1BtJ4oF3qM5ZwqIOGq';
var fcm = new FCM(serverKey);

*/

// ----------------------------------------------------------------

// Hasura Signup Page

var url_Signup = "https://auth.dankness95.hasura-app.io/v1/signup";


// backend api HomePage
app.get('/',(req,res) =>{
res.send('Welcome to the Backend API Built Using Hasura !! Compiled by Ankit');
});
// Authentication Module
// UI of Hasuras auth api is being used 
// --------------------------------------------------------------------------------------
// Registring Module
app.get('/register/:FName?/:LName?/:UserName/:pass/:Email/:Phone_no?', (req,res) => {

// Signing up using hasura hasura

var signup_body = {
	"provider": "username",
    "data": {
        "username": req.params.UserName,
        "password": req.params.pass
    }
};

requestOptions.body = JSON.stringify(signup_body);

fetchAction(url_Signup, requestOptions)
.then(function(response) {
 global.H_id = response.json();	
 n = n+1;
console.log(H_id.hasura_id);
	return response.json();
})
.then(function(result) {
//this.K_id = JSON.stringyfy(result.hasura_id);---------------------------
	console.log(JSON.stringify(result));
	
})
.catch(function(error) {
	console.log(error);
	res.send("S.F ->User Name Alredy Exist try logginig in with the Id");
});
n = n + randomInt(20,20000);// Temperoroary mechanism
console.log(n);
// --------------Signup details being sent to data base----------	                                      
//function wait(){ 

var reg_body = {
       "type": "insert", 
       "args": {
       "table":"User_Details",
       "objects":[
         {
         "Hasura_Id": JSON.stringify(H_id.hasura_id + n),
         "F_Name": req.params.FName,
         "L_Name": req.params.LName,
         "User_Name": req.params.UserName,
         "Pass": req.params.pass,
         "Email_Id": req.params.Email,
         "Phone_No": req.params.Phone_no
     }
       ]
       
       }
};
requestOptions.body = JSON.stringify(reg_body);

fetchAction(url_data, requestOptions)
.then(function(response) {
	return response.json();
	
})
.then(function(result) {
	console.log(JSON.stringify(result));
	res.send("Your Account has been created sucessfully ! ");
})
.catch(function(error) {
	res.send("D.B->Error Creating account try after some time");
}); 
console.log(JSON.stringify(H_id.hasura_id));
console.log(H_id);

//setTimeout(wait,3000);
});
// ----------------------------------------------------------------------------------------------
// Mobile customized authentication
var url_custom_login = "https://auth.dankness95.hasura-app.io/v1/login";


app.get('/mobile_login/:Username?/:Password?', (req,res)=> {


var body_Custom_Login = {
    "provider": "username",
    "data": {
        "username": req.params.Username,
        "password": req.params.Password
    }
};

requestOptions.body = JSON.stringify(body_Custom_Login);

fetchAction(url_custom_login, requestOptions)
.then(function(response) {
	return response.json();
})
.then(function(result) {
	console.log(result);
  if(result.code != 'invalid-creds')
  {
	res.send("Logged in"+  JSON.stringify(result.auth_token) +"  " + JSON.stringify(result.hasura_id))
	}
	else
	{
		res.send(JSON.stringify(result.message));
	}

	// To save the auth token received to offline storage
	 //var authToken = result.auth_token
	 //window.localStorage.setItem('HASURA_AUTH_TOKEN', authToken);
	 //res.send('logged in');
})
.catch(function(error) {
	console.log('Request Failed:' + error);
	res.send('error');
});

 
});
//---------------------------------------------------------
// Sending user info to the frontend for display
app.get('/return_user_info/:uid?/' , (req,res) => {

  var body_user_details_response = {
    "type": "select",
    "args": {
        "table": "User_Details",
        "columns": [
            "F_Name",
            "L_Name",
            "User_Name",
            "Email_Id",
            "Phone_No"
        ],
        "where": {
            "User_Name": {
                "$eq": req.params.uid
            }
        }
    }
};

requestOptions.body = JSON.stringify(body_user_details_response);

fetchAction(url_data, requestOptions)
.then(function(response) {
  return response.json();
})
.then(function(result) {
  res.json(result);
  console.log(result);
})
.catch(function(error) {
  console.log('Request Failed:' + error);
  res.send("User does not exist")
});


});
//-----------------------------------------------------------
/*
// -------------------------------------------------------------------------------------------------------
// Notification Sending Module using Fire Base
app.get('/auth/Send_Notification/:Token/:Title/:Notification_Message', (req,res) => {
var message = {
    to: res.params.Token, // required fill with device token or topics
    //collapse_key: 'your_collapse_key', 
    data: {
        //your_custom_data_key: 'your_custom_data_value'
    },
    notification: {
        title: res.params.Title,
        body: res.params.Notification_Message
    }
};

fcm.send(message)
    .then(function(response){
        res.send("Successfully sent with response: " + response);
    })
    .catch(function(err){
        res.send("Something has gone wrong!");
        console.error(err);
    });

});
*/
// ---------------------------------------------------------------------------
// Image upload url
var url_Upload = "https://filestore.dankness95.hasura-app.io/v1/file";
app.get('/Upload/:File_location?/', (req,res)=> {
//res.send('aaaaa');
var file = fs.readFile(res.params.File_location);
var requestOptions_upload = {
	method: 'POST',
	headers: {
	  "Content-Type": image/png,
      "Authorization": "Bearer" + "f215da1ee0d1c8074047afcacd785372e2665d448bffb2e6"
	},
	body: file
}

fetchAction(url_Upload, requestOptions_upload)
.then(function(response) {
	return response.json();
})
.then(function(result) {
	console.log(result);
	res.send("Image upladed sucess fully");
})
.catch(function(error) {
	console.log('Request Failed:' + error);
	res.send("Error uploading the file");
});

});
// Server Started
app.listen(port);
console.log('Test Server Started ! on port ' + port);