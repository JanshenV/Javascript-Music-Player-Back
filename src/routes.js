const express = require('express');
const routes = express();

const {
    CreateUser,
} = require('./controllers/users');

routes.post('/users', CreateUser);


module.exports = routes;