const express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let jwt = require('jsonwebtoken');
let expressJwt = require('express-jwt');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const sequelize = require('./database/conexion');

const port = 3000;
const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(bodyParser.json());

server.listen(port, () => {
    console.log(`Server listeting on port ${port}`)
});

//key for token enrollment
let jwtClave = "5XSNGM0bTFjNCpEV0ZNTElORS02Mg==";
server.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256']}).unless({ path: ["/users/login", "/users"] }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
server.use(limiter);

//Middleware for admin authorization
const authorization_Admin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const verify_Token = jwt.verify(token, jwtClave);
        if(verify_Token){
            req.user = verify_Token;
            return next();
        }
    } catch (err) {
        res.json({err: 'Failed to validate the role as administrator'})
    }
};

//USERS
server.get('/users', authorization_Admin, async function (req, res) {
    let is_admin = req.user.is_admin
    let iduser = req.user.user
    let sqlquery = 'SELECT * FROM users'
    if(is_admin === false) {
        sqlquery = sqlquery + ` WHERE idusers = '${iduser}'` 
    }
    await sequelize.query(
        sqlquery,
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
        res.status(200).send("user created successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.get("/users/login", function (req, res) {
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
        if (user.length === 0){
            return res.status(400).send("user not found")
        }
        let res_idUser = user[0].idusers;
        let res_is_admin = user[0].is_admin;
        //creation of the token to pass
        let token = jwt.sign({
            user: res_idUser,
            is_admin: Boolean(res_is_admin)
        }, jwtClave);
        let sesionToken = {
            token: token
        }   
        res.status(200).send(sesionToken);
    })
    .catch(function (error) {
        res.status(500).send(error)
    })
});

//PRODUCTS
server.get('/products', async function (req, res) {
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

server.post('/products', authorization_Admin, async (req, res) => {
    let is_admin = req.user.is_admin
    if (is_admin === false){
        return res.status(401).send('You are not authorized to create products')
    }    
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
        res.status(200).send("product created successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.get('/products/:id', async function (req, res) {
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

server.put('/products/:id', authorization_Admin, async (req, res) => {
    let is_admin = req.user.is_admin
    let id_product = req.params.id;
    if (is_admin === false){
        return res.status(401).send('You are not authorized to make modifications')
    }      
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
        res.status(200).send("product updated successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.delete('/products/:id', authorization_Admin, async (req, res) => {
    let is_admin = req.user.is_admin
    if (is_admin === false){
        return res.status(401).send('You are not authorized to delete products')
    }    
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
        res.status(200).send("product deleted successfully")
    })
    .catch(error => res.status(500).send(error))
});

//ORDERS
server.get('/orders', authorization_Admin, async function (req, res) {
    let is_admin = req.user.is_admin
    let iduser = req.user.user
    let sqlquery = "SELECT orders.idorders, orders.idusers, orders.total, orders.payment, orders.address, orders.date, orders.status, products.idproducts, products.name, products.price, products.picture, products.is_available FROM orders INNER JOIN orders_products ON orders.idorders = orders_products.idorders INNER JOIN products ON orders_products.idproducts = products.idproducts "
    if(is_admin === false) {
        sqlquery = sqlquery + ` WHERE idusers = '${iduser}'` 
    }
    await sequelize.query(
        sqlquery,
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (orders) {
        res.status(200).send(orders);
    })
    .catch(error => console.error(error))
});

server.post('/orders', authorization_Admin, async (req, res) => {
    let iduser = req.user.user
    const {
        total, payment, address, date, status, array_products
    } = req.body
    let ordersInfo = [iduser, total, payment, address, date, status];
    await sequelize.query(
        'INSERT INTO orders (`idusers`, `total`, `payment`, `address`, `date`, `status`) VALUES(?, ?, ?, ?, ?, ?)',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (orders) {
        let id_order = orders[0];
        array_products.forEach(idproduct => {
            sequelize.query(
                'INSERT INTO orders_products (`idorders`, `idproducts`) VALUES(?, ?)',
                {
                    replacements: [id_order, idproduct],
                    type: sequelize.QueryTypes.INSERT
                }
            )
        })
        res.status(200).send("order created successfully")
    })
    .catch(error => {
        res.status(500).send(error)
    })
});

server.get('/orders/:id', async function (req, res) {
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
    let id_order = req.params.id;
    const {
        status
    } = req.body
    let ordersInfo = [status, id_order];
    await sequelize.query(
        'UPDATE orders SET `status`= ? WHERE idorders = ?',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.UPDATE
        }
    )
    .then(function (orders) {
        res.status(200).send("orders updated successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.delete('/orders/:id', authorization_Admin, async (req, res) => {
    let is_admin = req.user.is_admin
    if (is_admin === false){
        return res.status(401).send('You are not authorized to delete orders')
    }    
    let id_order = req.params.id;
    let ordersInfo = [id_order];

    await sequelize.query(
        'DELETE FROM orders_products WHERE idorders = ?',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.DELETE
        }
    )
    .then(function (orders) {
        
        sequelize.query(
            'DELETE FROM orders WHERE idorders = ?',
            {
                replacements: ordersInfo,
                type: sequelize.QueryTypes.DELETE
            }
        )
        .then(function (orders) {
            res.status(200).send("order deleted successfully")
        })
        .catch(error => res.status(500).send(error))
    })
    .catch(error => res.status(500).send(error))   
});

//Middleware for error handling
server.use((err, req, res, next) => {
    let status = '500';
    const dataError = {
      codigo: '',
      mensaje: '',
      error: ''
    }
    if(err.name === 'UnauthorizedError') {
      dataError.codigo = '100';
      dataError.mensaje = 'You are not authorized to this route';
      status = '401';
    }
    else {
      dataError.codigo = '101';
      dataError.mensaje = 'An unexpected server-side error occurred';
      dataError.error = err;
      status = '500';
    }
    res.status(status).send(JSON.stringify(dataError));
});