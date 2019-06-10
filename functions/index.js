const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
admin.initializeApp();

function createHtmlTemplate(data, html) {
    let total = 0   
    for(var key in data) {
        if (key !== "id") {
            html += `<p>${key}: $${data[key]}</p>`
            total += data[key];
        }
    }
    html += `<h2>Total: $${parseInt(total)}</h4>`;
    return html;
}


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
        const id = req.query.id;
        const month = req.query.month;
        const data = req.query.data;
        console.log(JSON.parse(data));
        let html = '<h2>Here is a breakdown of your donation</h2>'
        var htmlTemplate = createHtmlTemplate(JSON.parse(data), html);


        const mailOptions =  {
            from: 'Do not reply <inf117group@gmail.com>',
            to: dest,
            subject: "Thank you for donating!",
            html: htmlTemplate
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
