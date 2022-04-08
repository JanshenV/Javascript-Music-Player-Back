const express = require('express');
const routes = express();

const {
    CreateUser,
    UserLogin,
    UserProfile
} = require('./controllers/users');

const ValidateToken = require('./middleware/ValidateToken');

routes.post('/users', CreateUser);
routes.post('/users/login', UserLogin);

routes.use(ValidateToken);

routes.get('/users/profile', UserProfile);


module.exports = routes;