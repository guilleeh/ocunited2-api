const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
admin.initializeApp();

/*
* Using GMAIL to send email
*/

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'inf117group@gmail.com',
        pass: 'ocunited'
    },
    tls: {
        rejectUnauthorized: false
      }
});

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const dest = req.query.dest;
        console.log(dest)

        const mailOptions =  {
            from: '<inf117group@gmail.com>',
            to: dest,
            subject: "Thank you for donating!",
            html: `<h2>Your donation is appreciated<h2> `
        };

        //returning result
        return transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
                return res.send(err.toString());
            }
            return res.send('Sent');
        });
    });
});
