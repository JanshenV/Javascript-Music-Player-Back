const nodemailer = require('nodemailer');
const handlebars = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

transporter.use('compile', handlebars({
    viewEngine: {
        extname: '.handlebars',
        defaultLayout: false
    },
    viewPath: 'classe/views/'
}));

module.exports = transporter;