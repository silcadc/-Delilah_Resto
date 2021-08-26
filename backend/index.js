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

server.get('/products/:id', async function (req, res) {
    console.log("get products")
    let id_product = req.params.id;
    await sequelize.query(
        'SELECT * FROM products WHERE idproducts = ?',
        {        
            replacements: [id_product],
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (products) {
        res.status(200).send(products);
    })
    .catch(error => console.error(error))
});

server.put('/products/:id', async (req, res) => {
    console.log("edicion de products")
    let id_product = req.params.id;
    const {
        name, price, picture, is_available
    } = req.body
    let productsInfo = [name, price, picture, is_available, id_product];
    await sequelize.query(
        'UPDATE products SET `name`= ?, `price`= ?, `picture`= ?, `is_available`= ? WHERE idproducts = ?',
        {
            replacements: productsInfo,
            type: sequelize.QueryTypes.UPDATE
        }
    )
    .then(function (products) {
        console.log(`data updated correctly + ${products}`)
        res.status(200).send("product updated successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.delete('/products/:id', async (req, res) => {
    console.log("envio products")
    let id_product = req.params.id;
    let productsInfo = [id_product];
    await sequelize.query(
        'DELETE FROM products WHERE idproducts = ?',
        {
            replacements: productsInfo,
            type: sequelize.QueryTypes.DELETE
        }
    )
    .then(function (products) {
        console.log(`data deleted correctly`)
        res.status(200).send("product deleted successfully")
    })
    .catch(error => res.status(500).send(error))
});

//ORDERS
server.get('/orders', async function (req, res) {
    console.log("get orders")
    await sequelize.query(
        'SELECT * FROM orders',
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (orders) {
        res.status(200).send(orders);
    })
    .catch(error => console.error(error))
});

server.post('/orders', async (req, res) => {
    console.log("envio de las orders")
    const {
        idusers, total, payment, address, date, status
    } = req.body
    let ordersInfo = [idusers, total, payment, address, date, status];
    await sequelize.query(
        'INSERT INTO orders (`idusers`, `total`, `payment`, `address`, `date`, `status`) VALUES(?, ?, ?, ?, ?, ?)',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (orders) {
        console.log("then de ordersInfo")
        console.log(`data inserted correctly + ${orders}`)
        res.status(200).send("order created successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.get('/orders/:id', async function (req, res) {
    console.log("get orders/id")
    let id_order = req.params.id;
    await sequelize.query(
        'SELECT * FROM orders WHERE idorders = ?',
        {        
            replacements: [id_order],
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (order) {
        res.status(200).send(order);
    })
    .catch(error => console.error(error))
});

server.patch('/orders/:id', async (req, res) => {
    console.log("edicion de orders")
    let id_order = req.params.id;
    const {
        status
    } = req.body
    let ordersInfo = [status, id_order];
    await sequelize.query(
        'UPDATE orders SET `status`= ? WHERE idorders = ?',
        //'UPDATE orders SET `idusers`= ?, `total`= ?, `payment`= ?, `address`= ?, `date`= ?, `status`= ? WHERE idorders = ?',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.UPDATE
        }
    )
    .then(function (orders) {
        console.log(`data updated correctly + ${orders}`)
        res.status(200).send("orders updated successfully")
    })
    .catch(error => res.status(500).send(error))
});