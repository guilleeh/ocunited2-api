const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const stripe = require("stripe")("sk_test_JTcthxlTgnrPaqHIOkOJeWxX00tNmpflcm");
const admin = require("firebase-admin");
const request = require('request');

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


/*
CODE FOR FIREBASE STARTS HERE
*/
let serviceAccount = require("./serviceAccountKey/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ocunited-db637.firebaseio.com"
});

let db = admin.database();
// creating a starting path in our database
let ref = db.ref('/');
let donationsRef = ref.child('Donations');
/*
CODE FOR FIREBASE ENDS HERE
*/

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];



function sendInfoToFirebase(info, donations, annonymous, token_id, donation_dist) {
    const d = new Date();
    currentMonth = monthNames[d.getMonth()];
    if(annonymous){
      donationsRef.child(currentMonth).child(token_id).set({
        personal_info: "Annonymous",
        total_donation: donations.amountTotal,
        donation_distribution: donation_dist,
      })
    } else {
      donationsRef.child(currentMonth).child(token_id).set({
        personal_info: { name: info.first_name + ' ' + info.last_name,
        email: info.email,
        phone: info.phone,
        street: info.street,
        city: info.city,
        state: info.state,
        postal: info.postal,
        country: info.country },
        total_donation: donations.amountTotal,
        donation_distribution: donation_dist
      });
    }
}

function getAllDonations(donationOrgs, donationAmounts, token_id) {
    console.log(donationOrgs, donationAmounts);
    donationsDictionary = {};
    for(var i = 0; i < donationOrgs.length; i++) {
      donationsDictionary[donationOrgs[i].replace(', ', '')] = donationAmounts[i];
    }
    donationsDictionary["id"] = token_id
    return donationsDictionary
}


app.get("/", function(req, res) {
  //when we get an http get request to the root/homepage
  res.send("Hello World!");
});

//POST request handler for the charge
app.post("/charge", async (req, res) => {
  const d = new Date();
  try {
    let allDonations = getAllDonations(req.body.donations.selectedOrganizations, req.body.donations.amountToOrg, req.body.id.token.id)
    let dataJSON = JSON.stringify(allDonations);
    console.log(allDonations)
    let {status} = await stripe.charges.create({
      amount: req.body.donations.amountTotal * 100,
      currency: "usd",
      description: dataJSON, //req.body.id.token.id,
      source: req.body.id.token.id
    });

    sendInfoToFirebase(req.body.data, req.body.donations, req.body.anon, req.body.id.token.id, allDonations);

    if(!req.body.anon) { //ONLY EXECUTE WHEN USER IS NOT ANNONYMOUS 
      request('https://us-central1-ocunited-db637.cloudfunctions.net/sendMail?dest=' + req.body.data.email + '&id=' + req.body.id.token.id + '&month=' + monthNames[d.getMonth()] + "&data=" + encodeURIComponent(dataJSON), { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body);
      });
    }

    res.json({status});
  } catch (err) {
    console.log(err)
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log('listening on port 9000');
});
