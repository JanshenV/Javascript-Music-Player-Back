const nodemailer = require('./nodemailer');

async function EmailWithNodemailer(email, username) {
    const data = {
        from: 'Javascript Music Player <do-not-reply@Javascript-music-player.com>',
        to: `${email}`,
        subject: 'Bem vindo a JMP',
        template: 'signup',
        context: {
            username,
            email
        }
    };

    nodemailer.sendMail(data);
};


module.exports = EmailWithNodemailer;