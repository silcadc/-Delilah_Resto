const express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let jwt = require('jsonwebtoken');
let expressJwt = require('express-jwt');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");

const sequelize = require('./database/conexion.js');
const {getAllUsers, insertUsers, getLogin} = require("./database/users.js")

const port = 3000;
const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(bodyParser.json());

server.listen(port, () => {
    console.log(`Server listeting on port ${port}`)
});

server.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256']}).unless({ path: ["/login"] }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
server.use(limiter);

server.get('/users', function (req, res) {
    getAllUsers()
    .then(users => {
        res.status(200).send(users);
    })
    .catch(error => {
        res.status(500).send(error)
    })
});

server.post('/users ', (req, res) => {
    const {
        username, fullname, email, telephone, address, password, is_admin
    } = req.body
    let userInfo = [username, fullname, email, telephone, address, password, is_admin];
    insertUsers(userInfo)
    .then(response => {
        res.status(200).send("user created successfully") 
    })
    .catch(error => {
        res.status(500).send(error)
    })
});

server.get('/users/login', function (req, res) {
    const {
        username, password
    } = req.body
    getUserLogin(username, password) 
    .then(user => {
        res.status(200).send(user);
    })
    .catch(error => {
        res.status(500).send(error)
    })
});