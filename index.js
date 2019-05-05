const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

const ads = [
  {title: 'Hello, world (again)!'}
];

app.get("/", function(req, res) {
  //when we get an http get request to the root/homepage
  res.send(ads);
});

app.get("/payment", function(req, res) {
  var stripe = Stripe('pk_test_mVIHxjDBueW9FOhHUrp3uD7d0042aj7bq6');
  var elements = stripe.elements();

  var card = elements.create('card');
  card.mount('#card-element');

  var promise = stripe.createToken(card);
  promise.then(function(result) {
    // result.token is the card token.
  });
})

app.listen(PORT, () => {
  console.log('listening on port 3000');
});
