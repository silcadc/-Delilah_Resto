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

//creamos una clave para la incriptacion del token
let jwtClave = "5XSNGM0bTFjNCpEV0ZNTElORS02Mg==";
server.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256']}).unless({ path: ["/users/login", "/users"] }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
server.use(limiter);

// Middleware para authorization de admin
const authorization_Admin = (req, res, next) => {
    try {
        console.log("1.entro al try")
        const token = req.headers.authorization.split(" ")[1];
        console.log("2.despues del split")
        console.log("3." + token)
        const verify_Token = jwt.verify(token, jwtClave);
        console.log("4. despues de verify token")
        if(verify_Token){
            console.log("5. mirando las condiciones")
            req.user = verify_Token;
            console.log(req.user)
            console.log(verify_Token)
            console.log("7.verificando el usuario admin")
            return next();
        }
    } catch (err) {
        res.json({err: 'Error al validar el rol como administrador'})
    }
};

//USERS
server.get('/users', authorization_Admin, async function (req, res) {
    console.log('10.viendo el is_admin')
    console.log(req.user)
    let is_admin = req.user.is_admin
    let iduser = req.user.user
    console.log(is_admin)
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
        console.log("impresion de user " + user)
        console.log(user)
        let res_idUser = user[0].idusers;
        let res_is_admin = user[0].is_admin;
        console.log("impresion de user " + res_is_admin)
        console.log(Boolean(res_is_admin))
        //Creamos el token para pasar
        let token = jwt.sign({
            user: res_idUser,
            is_admin: Boolean(res_is_admin)
        }, jwtClave);

        let sesionToken = {
            token: token
        }   
        // req.is_admin = Boolean(res_is_admin)
        // console.log("asdf")

        // console.log(req.is_admin)
        //envio Token
        res.status(200).send(sesionToken);
        console.log(sesionToken)
        //res.status(200).send(user);
    })
    .catch(function (error) {
        res.status(500).send(error)
    })
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

server.post('/products', authorization_Admin, async (req, res) => {
    console.log("envio products")
    let is_admin = req.user.is_admin
    if (is_admin === false){
        return res.status(401).send('Usted no esta autorizado para crear productos')
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

server.put('/products/:id', authorization_Admin, async (req, res) => {
    console.log("edicion de products")
    let is_admin = req.user.is_admin
    let id_product = req.params.id;
    if (is_admin === false){
        return res.status(401).send('No esta autorizado para hacer modificacion')
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
        console.log(`data updated correctly + ${products}`)
        res.status(200).send("product updated successfully")
    })
    .catch(error => res.status(500).send(error))
});

server.delete('/products/:id', authorization_Admin, async (req, res) => {
    console.log("envio products")
    let is_admin = req.user.is_admin
    if (is_admin === false){
        return res.status(401).send('Usted no esta autorizado para borrar productos')
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
        console.log(`data deleted correctly`)
        res.status(200).send("product deleted successfully")
    })
    .catch(error => res.status(500).send(error))
});

//ORDERS
server.get('/orders', authorization_Admin, async function (req, res) {//solo permitido para un admin
    console.log("get orders")//el user normal llamara solo sus pedidos
    let is_admin = req.user.is_admin
    let iduser = req.user.user
    console.log(is_admin)
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

server.post('/orders', async (req, res) => {
    console.log("envio de las orders")
    const {
        idusers, total, payment, address, date, status, array_products
    } = req.body
    console.log(`aqui el array: ${array_products}`)
    let ordersInfo = [idusers, total, payment, address, date, status];
    await sequelize.query(
        'INSERT INTO orders (`idusers`, `total`, `payment`, `address`, `date`, `status`) VALUES(?, ?, ?, ?, ?, ?)',
        {
            replacements: ordersInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (orders) {
        console.log(`aqui orderssss: ${orders}`)
        let id_order = orders[0];
        console.log(`eliminado el 1: ${id_order}`)
        console.log(`data inserted correctly + ${orders}`)
        //aqui creo la tabla
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
})

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


// Middleware para manejo de errores
server.use((err, req, res, next) => {
    let status = '500';
    const dataError = {
      codigo: '',
      mensaje: '',
      error: ''
    }
    if(err.name === 'UnauthorizedError') {
      dataError.codigo = '100';
      dataError.mensaje = 'No está autorizado a esta ruta';
      status = '401';
    }
    else {
      dataError.codigo = '101';
      dataError.mensaje = 'Ocurrio un error inesperado del lado del servidor';
      dataError.error = err;
      status = '500';
    }
    res.status(status).send(JSON.stringify(dataError));
});

