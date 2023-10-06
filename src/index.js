const dotenv = require('dotenv');
const path = require('path');
//const admin = require('firebase-admin');
//var serviceAccount = require("../twhatsapp-a6696-firebase-adminsdk-g8ygn-3e9aaf585d.json");

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
  });

console.log(process.env.DATABASE_URL);
/*
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  }
)
*/
var app = require('./app');
var port = process.env.PORT || 3999;

app.listen(port, function () {
  console.log("Escuchando en puerto " + port);
});

