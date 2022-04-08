const knex = require('../database/connection');
const bcrypt = require('bcrypt');


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


module.exports = SecondValidation;