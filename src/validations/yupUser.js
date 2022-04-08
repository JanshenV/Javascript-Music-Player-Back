const yup = require('./yup');

const yupCreateUser = yup.object().shape({
    username: yup.string().min(3).max(55).required(),
    email: yup.string().email().required(),
    password: yup.string().min(9).required()
});


module.exports = {
    yupCreateUser,
}