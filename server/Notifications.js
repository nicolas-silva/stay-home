const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Expo } = require("expo-server-sdk");
const moment = require("moment");

// Starting our app.
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to database
const connection = mysql.createPool({
  host: "localhost", // Your connection adress (localhost).
  user: "root", // Your database's username.
  password: "", // Your database's password.
  database: "stay_home", // Your database's name.
  port: 3306,
});

// Create a new Expo SDK client
let expo = new Expo();
let messages = [];
let tickets = [];
let receiptIds = [];

// TEST to send notifications
// const notify = setImmediate(async function() {
//   try{
//     messages.push({
//       to: 'ExponentPushToken[1DYgEtCfhTovFqVtavBHts]',
//       sound: 'default',
//       title: 'Hi, Nicolas Lozano',
//       body: 'This is your test',
//       data: { user: 'Nicolas Lozano',
//               email: 'nicolaslozanosilva@gmail.com',
//               userId: 25,
//               lat:   '-37.84455990000',
//               lng:   '144.9761827'
//             },
//     })
//     await sendNotifications();
//   }
//   catch (error) {
//     console.log(error);
//   }
// }); //on start

// Routine to send notifications
// const notify = setImmediate(async function () {
const notify = setInterval(async function () {
  try {
    await selectMessages();
  } catch (error) {
    console.log(error);
  }
}, 600000); //every 20 minutes
// }); //on start for test

// ------------------ SELECT USERS FOR NOTIFICATION

async function selectMessages() {
  messages = [];
  tickets = [];
  receiptIds = [];
  console.log("Start messages " + new Date());
  //Select users
  connection.getConnection(function (err, connection) {
    const LIMIT = moment().subtract(3, "hours");
    const today = new Date();
    // const LIMIT = 3 * 60 * 60 * 1000; /* 3hours in ms */

    var sql = `
          select 
          activeUsers.name, activeUsers.userkey, activeUsers.pushToken, activeUsers.latitude, activeUsers.longitude, 
          lastCheckins.checkingtime
            from (
              select max(checkin.checkingtime) as checkingtime, checkin.userid
                  from checkin group by checkin.userid order by checkin.checkingtime
                  ) as lastCheckins
            inner join (
              select user.userkey, user.name, user.email, user.device, user.pushToken, user.latitude, user.longitude
                  from user where INSTR(pushToken, 'PushToken')
                  ) as activeUsers
            on lastCheckins.userid=activeUsers.userkey`;

    // Executing the MySQL query (select all data from the 'users' table).
    var query = connection.query(sql);
    // If some error occurs, we throw an error.
    query
      .on("error", function (error) {})
      .on("fields", function (fields) {
        // the field packets for the rows to follow
      })
      .on("result", function (row) {
        // Pausing the connnection is useful if your processing involves I/O
        connection.pause();
        if (today.getHours() > 7 && today.getHours() < 23) {
          console.log("correct time");
          let  dateCheckin = moment(row.checkingtime);
          if (dateCheckin.isBefore(LIMIT)) {
            console.log("old checkin");
            if (!Expo.isExpoPushToken(row.pushToken)) {
              console.error(
                `Push token ${pushToken} is not a valid Expo push token`
              );
            } else {
              let title = "Hi, " + row.name;
              
              messages.push({
                to: row.pushToken,
                sound: "default",
                title: title,
                body: "Please, check-in now.",
                data: { user: row.name,
                        userId: row.userkey,
                        lat:   row.latitude,
                        lng:   row.longitude
                      },
                ttl: 300000,
              });
            }
            console.log(messages);
          }
        }
        connection.resume();
      })
      .on("end", function () {
        sendNotifications();
      });
    return true;
  });
}

// SEND NOTIF
async function sendNotifications() {
  let chunks = expo.chunkPushNotifications(messages);
  (async () => {
    console.log("prepare chunks " + chunks);
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
          if (status === "ok") {
            continue;
          } else if (status === "error") {
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
