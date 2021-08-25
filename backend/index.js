const express = require('express');
//npm install body-parser
let bodyParser = require('body-parser');
const port = 3000;
const cors = require('cors');
//npm install jsonwebtoken
let jwt = require('jsonwebtoken');
//npm install express-jwt
let expressJwt = require('express-jwt');

const server = express();
server.use(express.json());
server.listen(port, () => {
    console.log("Servidor inicializado en puerto 3000")
});

server.use(cors()) //para que permita que manden informacion 
//desde afuera de este mismo puerto