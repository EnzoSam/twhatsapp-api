var express = require("express"),
bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var wsRoutes = require('./route/ws.route');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN);
     res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
     res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS,DELETE,PATCH');
     res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
     if (req.method === "OPTIONS") {
         return res.status(200).end();
     }
     next();
 });

app.use('', wsRoutes);

module.exports = app;