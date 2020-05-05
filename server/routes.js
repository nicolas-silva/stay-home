const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { Expo } = require('expo-server-sdk');
const moment = require('moment');

// Create a new Expo SDK client
let expo = new Expo();
let messages = [];
let tickets = [];
let receiptIds = [];

// Routine to send notifications
const notify = setInterval(async function() {
  try{
    let select = await selectMessages();
  }
  catch (error) {
    console.log(error);
  }
}, 600000); //every hour

// ------------------

const connection = mysql.createPool({
    host     : 'localhost', // Your connection adress (localhost).
    user     : 'root',     // Your database's username.
    password : '',        // Your database's password.
    database : 'stay_home',   // Your database's name.
    port     : 3306,
  });

  // Starting our app.
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function selectMessages(){
  messages= [];
  tickets = [];
  receiptIds = [];
  console.log('Start messages ' + new Date());
  //Select users
  connection.getConnection(function (err, connection) {

    const LIMIT = moment().subtract(3, 'hours');
    const today = new Date();
    // const LIMIT = 3 * 60 * 60 * 1000; /* 3hours in ms */

    var sql = `
      select activeUsers.name, activeUsers.userkey, activeUsers.email, activeUsers.device, 
      activeUsers.pushToken, activeUsers.latitude, activeUsers.longitude, lastCheckins.checkingtime
      from (
        select max(checkin.checkingtime) as checkingtime, checkin.useremail, checkin.userdevice
        from checkin group by checkin.useremail, checkin.userdevice order by checkin.checkingtime
      ) as lastCheckins
      inner join (
        select user.userkey, user.name, user.email, user.device, user.pushToken, user.latitude, user.longitude
        from user where INSTR(pushToken, 'PushToken')
      ) as activeUsers
      on lastCheckins.useremail=activeUsers.email && INSTR(lastCheckins.userdevice, activeUsers.device)`;

    // Executing the MySQL query (select all data from the 'users' table).
    var query = connection.query(sql);
      // If some error occurs, we throw an error.
    query
      .on('error', function(error){

      })
      .on('fields', function(fields) {
        // the field packets for the rows to follow
      })
      .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        connection.pause();
        if (today.getHours() > 7 && today.getHours() < 23)
        {
          console.log('correct time');
          const dateCheckin = moment(row.checkingtime);
          if (dateCheckin.isBefore(LIMIT)) {
            console.log('old checkin');
            if (!Expo.isExpoPushToken(row.pushToken)) {
              console.error(`Push token ${pushToken} is not a valid Expo push token`);
            }
            else{
              let title = 'Hi, ' + row.name;
              messages.push({
                to: row.pushToken,
                sound: 'default',
                title: title,
                body: 'Please, check-in now.',
                data: { withSome: 'data' },
              })
            }
            console.log(messages);
          }
        }
        connection.resume();
      })
      .on('end', function() {
        sendNotifications();
      });
      return true;
  });
 }

async function sendNotifications(){
  let chunks = expo.chunkPushNotifications(messages);
  (async () => {
    console.log('prepare chunks ' + chunks);
    for (let chunk of chunks) {
      try {
        console.log(chunk);
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })(); 
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
}


// Creating a GET route that returns data from the 'users' table.
app.get('/users', function (req, res) {
    // Connecting to the database.
    connection.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connection.query('SELECT * FROM user', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;

      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results);
    });
  });
});

// Creating a GET route that returns data from the 'checkin' table.
app.get('/checkin', function (req, res) {
    // Connecting to the database.
    connection.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connection.query('SELECT * FROM checkin', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;

      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results);
    });
  });
});


app.post("/checkin", function(req, res) {
    // get data from forms and add to the table called user..
    console.log(req.body);
    var useremail           = req.body.userEmail;
    var userdevice          = req.body.userDevice;
    var currentAltitude     = req.body.currentAltitude;
    var currentLongitude    = req.body.currentLongitude;
    var currentLatitude     = req.body.currentLatitude;
    var currentSpeed        = req.body.currentSpeed;
    var currentHeading      = req.body.currentHeading;
    var currentMocked       = req.body.currentMocked;
    var currentAccuracy     = req.body.currentAccuracy;
    var distance            = req.body.distance;

    console.log("Check-in: " + useremail, currentLatitude, currentLongitude, currentAccuracy);

    var sql = `INSERT INTO stay_home.checkin(
                useremail, userdevice, 
                altitude, latitude, longitude,
                speed, heading, 
                mocked, accuracy, distance)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    connection.query( sql,
        [useremail, userdevice, 
          currentAltitude, currentLatitude, currentLongitude,
          currentSpeed, currentHeading, 
          currentMocked, currentAccuracy, distance],
         function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    res.send(result);
  });
});

app.post("/users", function(req, res) {
    // get data from forms and add to the table called user..
    console.log(req.body);
    var username      = req.body.fullName;
    var useridnum     = req.body.ID;
    var userdob       = req.body.dob;
    var usertype      = req.body.type;
    var userdevice    = req.body.device;
    var userphone     = req.body.mobile;
    var useremail     = req.body.email;
    var useradd       = req.body.streetAddress;
    var useraddlat    = req.body.addressLatitude; 
    var useraddlon    = req.body.addressLongitude;
    var usertoken     = req.body.pushToken;

    console.log(username, userphone, useradd, useraddlat, useraddlon);

    var sql = `INSERT INTO stay_home.user(
                name, idnum, idtype, device,
                phone, email, dob,
                address, latitude, longitude,
                pushToken)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    connection.query( sql,
        [username, useridnum, usertype, userdevice, 
          userphone, useremail, userdob,
          useradd, useraddlat, useraddlon,
          usertoken],
         function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          res.send(result);
        });
});

// execute(){
//   curl -H "Content-Type: application/json" -X POST "" -d '{
//   "to": {expoPushTo},
//   "title":"hello",
//   "body": "world"
// }'
// }

// execute(() =>
//   {
  // const https = require('https');

  // const data = JSON.stringify({
  //   "to": "ExponentPushToken[1DYgEtCfhTovFqVtavBHts]",
  //   "title":"hello",
  //   "body": "world"
  // });
  
  // const options = {
  //   hostname: 'https://exp.host/--/api/v2/push/send',
  //   method: 'POST',
  //   headers: {
  //     host: 'exp.host',
  //     accept: 'application/json',
  //     'accept-encoding': 'gzip, deflate',
  //     'content-type': 'application/json',
  //   }
  // };

  // setInterval(function() {
  //   try{
  //     https.request(options, data, res => {
  //       res.on('data', d => {
  //         process.stdout.write(d)
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       })
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  //   }
  //   catch{
  //     console.log('erro on request');
  //   }
  // }, 5000);

// Starting our server.
app.listen(3000, () => {
 console.log('Go to http://localhost:3000/users so you can see the data.');
});