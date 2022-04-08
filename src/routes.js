const express = require('express');
const routes = express();

const {
    CreateUser,
    UserLogin,
} = require('./controllers/users');

routes.post('/users', CreateUser);
routes.post('/users/login', UserLogin);


module.exports = routes;