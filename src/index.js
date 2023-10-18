const dotenv = require('dotenv');
const path = require('path');
const admin = require('firebase-admin');

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
  });
  

const serviceAccount = {
  type:  process.env.SERVICE_TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: JSON.parse(process.env.PRIVATE_KEY).private_key,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_ORIVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};

admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  }
);

var app = require('./app');
var port = process.env.PORT || 3999;

app.listen(port, function () {
  console.log("Escuchando en puerto " + port);
});

