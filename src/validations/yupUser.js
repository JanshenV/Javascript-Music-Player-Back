const yup = require('./yup');

const yupCreateUser = yup.object().shape({
    username: yup.string().min(3).max(55).required(),
    email: yup.string().email().required(),
    password: yup.string().min(9).required()
});

const yupUserLogin = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(9).required()
});

const yupUserEdit = yup.object().shape({
    username: yup.string(),
    email: yup.string().email(),
    password: yup.string()
});

module.exports = {
    yupCreateUser,
    yupUserLogin,
    yupUserEdit
};