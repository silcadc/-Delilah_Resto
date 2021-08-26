const express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let jwt = require('jsonwebtoken');
let expressJwt = require('express-jwt');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const sequelize = require('./database/conexion');

//const {getAllUsers, insertUsers, getLogin} = require("./database/users.js")

const port = 3000;
const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(bodyParser.json());

server.listen(port, () => {
    console.log(`Server listeting on port ${port}`)
});

//server.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256']}).unless({ path: ["/login"] }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
server.use(limiter);

//USERS
server.get('/users', async function (req, res) {
    await sequelize.query(
        'SELECT * FROM users',
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (users) {
        res.status(200).send(users);
    })
    .catch(error => console.log(error))
});

server.post('/users', async (req, res) => {
    console.log("entro a postUsuarios")
    const {
        username, fullname, email, telephone, address, password, is_admin
    } = req.body
    let userInfo = [username, fullname, email, telephone, address, password, is_admin];
    await sequelize.query(
        'INSERT INTO users (`username`, `fullname`, `email`, `telephone`, `address`, `password`, `is_admin`) VALUES(?, ?, ?, ?, ?, ?, ?)',
        {
            replacements: userInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (users) {
        console.log("then de insertUsers")
        console.log(`data inserted correctly + ${users}`)
        res.status(200).send("user created successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.get('/users/login', function (req, res) {
    const {
        username, password
    } = req.body
    sequelize.query(
        `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (user) {
        res.status(200).send(user);
    })
    .catch(error => res.status(500).send(error))
});

//PRODUCTS
server.get('/products', async function (req, res) {
    console.log("get products")
    await sequelize.query(
        'SELECT * FROM products',
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (products) {
        res.status(200).send(products);
    })
    .catch(error => console.error(error))
});

server.post('/products', async (req, res) => {
    console.log("envio products")
    const {
        name, price, picture, is_available
    } = req.body
    let productsInfo = [name, price, picture, is_available];
    await sequelize.query(
        'INSERT INTO products (`name`, `price`, `picture`, `is_available`) VALUES(?, ?, ?, ?)',
        {
            replacements: productsInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (products) {
        console.log("then de productsInfo")
        console.log(`data inserted correctly + ${products}`)
        res.status(200).send("product created successfully")
    })
    .catch(error => res.status(500).send(error))
});
