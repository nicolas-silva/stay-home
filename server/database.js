const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const moment = require("moment");

// Starting our app.
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------------------
const connection = mysql.createPool({
  host: "localhost", // Your connection adress (localhost).
  user: "root", // Your database's username.
  password: "", // Your database's password.
  database: "stay_home", // Your database's name.
  port: 3306,
});

// Creating a GET route that returns data from the 'users' table.
app.get("/users", function (req, res) {
  // Connecting to the database.
  connection.getConnection(function (err, connection) {
    // Executing the MySQL query (select all data from the 'users' table).
    connection.query("SELECT * FROM user", function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;

      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results);
    });
  });
});

// Creating a GET route that returns data from the 'checkin' table.
app.get("/checkin", function (req, res) {
  // Connecting to the database.
  connection.getConnection(function (err, connection) {
    // Executing the MySQL query (select all data from the 'users' table).
    connection.query("SELECT * FROM checkin", function (
      error,
      results,
      fields
    ) {
      // If some error occurs, we throw an error.
      if (error) throw error;

      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results);
    });
  });
});


app.post("/listlocations", function (req, res) {
  let userid = req.body.userkey;
  console.log('Req for list locations:: ' + userid);
  connection.query("SELECT * FROM checkin where userid = ? order by checkingtime desc", [userid], function (
    error,
    results,
    fields
  ) {
    // If some error occurs, we throw an error.
    if (error) throw error;
    console.log(results.length + ' results');

    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results);
  });
});

app.post("/remove", function (req, res) {
  console.log('remove location ' + req.body.checkingid);
  let checkingid = req.body.checkingid;
  connection.query("delete from checkin where idchecking=?;", [checkingid], function (
    error,
    results,
    fields
  ) {
    // If some error occurs, we throw an error.
    if (error) console.log(error);
    console.log('removed');

    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results);
  });
});

app.post("/checkin", function (req, res) {
  // get data from forms and add to the table called user..
  console.log('Save location: ' + req.body.userid + ' ' + req.body.distance);
  if(req.body.userid){
    var userid = req.body.userid;
    var currentAltitude = req.body.altitude;
    var currentLongitude = req.body.longitude;
    var currentLatitude = req.body.latitude;
    var currentSpeed = req.body.speed;
    var currentHeading = req.body.heading;
    var currentMocked = req.body.mocked;
    var currentAccuracy = req.body.accuracy;
    var distance = req.body.distance;

    var sql = `INSERT INTO stay_home.checkin(
                  userid, 
                  altitude, latitude, longitude,
                  speed, heading, 
                  mocked, accuracy, distance)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    connection.query(
      sql,
      [
        userid,
        currentAltitude,
        currentLatitude,
        currentLongitude,
        currentSpeed,
        currentHeading,
        currentMocked,
        currentAccuracy,
        distance,
      ],
      function (err, result) {
        if (err) throw err;
        console.log("1 record inserted " + result.insertId);
        res.send(result);
      }
    );
  }
});

app.post("/users", function (req, res) {
  // get data from forms and add to the table called user..
  console.log('New user: ' + req.body.email);
  var result = null;

  var username = req.body.name;
  var userphone = req.body.phone;
  var useridnum = req.body.idnum;
  var usertype = req.body.idtype;
  var useremail = req.body.email;
  var userdob = req.body.dob;
  var userdevice = req.body.device;
  var usertoken = req.body.pushToken;
  var useradd = req.body.address;
  var useraddlat = req.body.latitude;
  var useraddlon = req.body.longitude;
  var sql = `INSERT INTO stay_home.user(
            name, idnum, idtype, device,
            phone, email, dob,
            address, latitude, longitude,
            pushToken)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  var query = connection.query(sql, [
    username,
    useridnum,
    usertype,
    userdevice,
    userphone,
    useremail,
    userdob,
    useradd,
    useraddlat,
    useraddlon,
    usertoken,
  ]);
  query
    .on("error", function (error) {
      console.log(error);
    })
    .on("fields", function (fields) {
      // the field packets for the rows to follow
    })
    .on("result", function (row) {
      // Pausing the connnection is useful if your processing involves I/O
      // connection.pause();
      result = row;
      console.log("1 record inserted");
      console.log('userkey: ' + row.insertId);
      // connection.resume();
    })
    .on("end", function () {
      res.send(result);
    });
});

// Creating a GET route that returns data from the 'users' table.
app.post("/update", function (req, res) {
  console.log('Update user: ' + req.body.userkey);
  const name      = req.body.name;
  const email     = req.body.email;
  const phone     = req.body.mobile;
  const address   = req.body.address;
  const latitude  = req.body.latitude;
  const longitude = req.body.longitude;
  const dob       = req.body.dob;
  const idtype    = req.body.type;
  const idnum     = req.body.ID;
  const userkey   = req.body.userkey;
  var result      = null;
  var sql = `update user
              set name = ?, email = ?, phone = ?,
              address = ?, latitude = ?, longitude = ?, 
              dob = ?, idtype = ?, idnum = ?
              where userkey = ?;`;
  connection.query(sql,[name, email, phone, address, latitude, longitude, dob, idtype, idnum, userkey], 
                  function(err,row){
    if(err) 
      console.log(err);
    if (row)
    {
      console.log('User updated');
      result = row;
      res.send(result);
    }
    else
      res.send(null);
  });
});

// Creating a GET route that returns data from the 'users' table.
app.post("/login", function (req, res) {
  console.log('login: ' + req.body.email);
  var result = null;
  var email = req.body.email;
  var device = req.body.device;
  var sql = `select * from user where email = ? and INSTR(?, device)  
              order by userkey desc limit 1`;
  connection.query(sql, [email, device], function(err,row){
    if(err) throw err;
    if (row[0])
    {
      console.log('login authorized to ' + req.body.device);
      res.send(row[0]);
    }
    else
      res.send(null);
  });
});
// Creating a GET route that returns data from the 'users' table.
app.post("/getuser", function (req, res) {
  console.log('get user' + req.body.userkey);
  var result = null;
  var userkey = req.body.userkey;
  var sql = `select * from user where userkey = ?  
              order by userkey desc limit 1`;
  connection.query(sql, [userkey], function(err,row){
    if(err) throw err;
    if (row[0])
    {
      console.log('found user' + req.body.userkey);
      res.send(row[0]);
    }
    else
      res.send(null);
  });
});

// Starting our server.
// app.listen(3000, () => {       //production
app.listen(3000, () => {          //test
  console.log("Go to http://localhost:3000/users so you can see the data.");
});
