const knex = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('../services/nodemailer');

const {
    yupCreateUser,
    yupUserLogin,
    yupUserEdit
} = require('../validations/yupUser');

async function SecondValidation(email, password) {
    let existingEmail = await knex('users')
        .where({ email })
        .first();

    if (existingEmail) {
        return { existingEmail };
    };

    //Password must be min 9 characters. One being upperCase, another lowerCaser and a special character
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$&*]).{9,}$/;
    if (!strongPassword.test(password)) {
        let validateResponse = `
            Senha deve contar ao mínimo um dígito numérico.
            Senha deve ter ao mínimo um dígito em caixa baixa.
            Senha deve ter ao mínimo um dígito em caixa alta.
            Senha deve ter conter no mínimo um caractere especial.
            `.trim();
        return { validateResponse };
    } else {
        const encryptedPassword = await bcrypt.hash(String(password), 10);
        return { encryptedPassword }
    };
};

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
// Controllers

async function CreateUser(req, res) {
    let {
        username,
        email,
        password
    } = req.body;

    const reqBodyLength = Object.keys(req.body).length;

    if (reqBodyLength === 0) return res.status(400).json({
        message: 'Todos os campos são obrigatórios.'
    });

    try {
        await yupCreateUser.validate(req.body);

        email = email.toLowerCase();
        const { validateResponse, existingEmail, encryptedPassword } = await SecondValidation(email, password);

        if (existingEmail) return res.status(400).json({
            message: 'Email já utilizado por outro usuário.'
        });

        if (validateResponse) return res.status(400).json({
            message: validateResponse
        });

        const newUser_Data = {
            username,
            email,
            password: encryptedPassword
        };

        const insertingUserDB = await knex('users')
            .insert(newUser_Data);

        EmailWithNodemailer(email, username);

        return res.status(201).json({
            message: 'Usuário criado com sucesso.'
        });
    } catch ({ message }) {
        return res.status(400).json({ message });
    };

};

async function UserLogin(req, res) {
    const { email, password } = req.body;

    try {
        await yupUserLogin.validate(req.body);

        const { existingEmail: User } = await SecondValidation(email);

        if (User) {
            const passwordCompare = await bcrypt.compare(password, User.password);
            if (!passwordCompare) return res.status(401).json({
                message: 'Email e senha não conferem.'
            });
        };

        if (!User) return res.status(404).json({
            message: 'Email e senha não conferem.'
        });

        const token = jwt.sign({ id: User.id },
            process.env.SECRET_JWT, { expiresIn: '8h' });

        return res.status(200).json({ token });

    } catch ({ message }) {
        return res.status(400).json({ message });
    };
};

async function UserProfile(req, res) {
    return res.status(200).json(req.user);
};

async function UserEdit(req, res) {
    let {
        username,
        email,
        password
    } = req.body;

    const user = req.user;
    const reqBodyLength = Object.keys(req.body).length;

    if (reqBodyLength === 0) return res.status(400).json({
        message: 'Ao menos um campo necessário para editar usuário.'
    });

    try {
        await yupUserEdit.validate(req.body);

        if (username) {
            if (username.length < 3 || username.length > 55) return res.status(400).json({
                message: 'Username inválido.'
            });
        };

        if (email) {
            const { existingEmail } = await SecondValidation(email);
            if (existingEmail && email !== user.email) return res.status(400).json({
                message: 'Email já sendo utilizado por outro usuário.'
            });
        };

        if (password) {
            if (password.length < 9) return res.status(400).json({
                message: 'Password tem de ter no mínimo 9 caracteres.'
            });

            const { validateResponse, encryptedPassword } = await SecondValidation("", password);
            if (validateResponse) return res.status(400).json({
                message: validateResponse
            });

            password = encryptedPassword;
        };

        const editUser_Data = {
            username: username ? username : user.username,
            email: email ? email : user.email,
            password: password ? password : user.password
        };

        const updatingUserData = await knex('users')
            .where({ id: user.id })
            .update(editUser_Data)
            .returning(['id', 'username', 'email']);



        return res.status(200).json({
            message: 'Usuário alterado com sucesso.',
            userData: updatingUserData
        });

    } catch ({ message }) {
        return res.status(400).json({
            message
        })
    }
};



module.exports = {
    CreateUser,
    UserLogin,
    UserProfile,
    UserEdit
};