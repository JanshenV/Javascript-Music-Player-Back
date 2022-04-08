const knex = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {
    yupCreateUser,
    yupUserLogin,
} = require('../validations/yupUser');

// Controllers
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


module.exports = {
    CreateUser,
    UserLogin
};