const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const stripe = require("stripe")("sk_test_JTcthxlTgnrPaqHIOkOJeWxX00tNmpflcm");
const admin = require("firebase-admin");

const app=express().use('*', cors());

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
app.use(express.json())

let serviceAccount = require("./serviceAccountKey/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ocunited-db637.firebaseio.com"
});

let db = admin.database();
// creating a starting path in our database
let ref = db.ref('/');
let donationsRef = ref.child('donations');

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];



function sendInfoToFirebase(info, donations, annonymous) {
    const d = new Date();
    currentMonth = monthNames[d.getMonth()];
    if(annonymous){
      donationsRef.child(currentMonth).push({
        Name: "Annonymous",
        donation: donations.amountTotal
      })
    } else {
      donationsRef.child(currentMonth).push({
        name: info.first_name + ' ' + info.last_name,
        email: info.email,
        phone: info.phone,
        street: info.street,
        city: info.city,
        state: info.state,
        postal: info.postal,
        country: info.country,
        donation: donations.amountTotal
      });
    }
}


app.get("/", function(req, res) {
  //when we get an http get request to the root/homepage
  res.send("Hello World!");
});

//POST request handler for the charge
app.post("/charge", async (req, res) => {
  try {
    let {status} = await stripe.charges.create({
      amount: req.body.donations.amountTotal * 100,
      currency: "usd",
      description: req.body.id.token.id,
      source: req.body.id.token.id
    });

    sendInfoToFirebase(req.body.data, req.body.donations, req.body.anon)

    res.json({status});
  } catch (err) {
    console.log(err)
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log('listening on port 9000');
});
