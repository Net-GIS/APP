//created Nik Hendricks 8/31/2023
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {Client} = require('pg')
const api = require('./api.js');
const https = require('https')
const http = require('http')

const privateKey = fs.readFileSync('/etc/letsencrypt/live/netgis.app/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/netgis.app/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/netgis.app/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

https.createServer(credentials, app).listen(443);

//https.createServer(options, app).listen(443);

const client = new Client({
    user: 'gis',
    host: 'localhost',
    database: 'gis_data',
    password: 'rootpass',
    port: 5432, // Default PostgreSQL port
});



app.use(bodyParser.json({ limit: '500mb' })); // Adjust the limit according to your needs
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true })); // Adjust the limit according to your needs

app.use(cookieParser());

// Middleware to set Strict-Transport-Security header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
      api.routes(app, client);
    }
});

http.createServer(app).listen(80);
