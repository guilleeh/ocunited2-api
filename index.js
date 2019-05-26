const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const stripe = require("stripe")("sk_test_JTcthxlTgnrPaqHIOkOJeWxX00tNmpflcm");
const admin = require("firebase-admin");

const app = express();

app.use(express.json());
// adding Helmet to enhance your API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan('combined'));
//retrieve payload from the POST request
app.use(require("body-parser").text());

let serviceAccount = require("./serviceAccountKey/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ocunited-db637.firebaseio.com"
});

const db = admin.database();
// creating a starting path in our database
const ref = db.ref('/');
const usersRef = ref.child('donations');
usersRef.push({
  firstDonation: "30",
  secondDonation: "50",
});



app.get("/", function(req, res) {
  //when we get an http get request to the root/homepage
  res.send("Hello World!");
});

//POST request handler for the charge
app.post("/charge", async (req, res) => {
  try {
    let {status} = await stripe.charges.create({
      amount: 5000,
      currency: "usd",
      description: "An example charge",
      source: req.body
    });

    res.json({status});
  } catch (err) {
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log('listening on port 9000');
});
