const Sequelize = require('sequelize');//se inicializa la libreria sequelize
const path = 'mysql://root:admin@localhost:3307/delilah_resto';//la cadena de conexion
//la anterior linea es la ruta donde esta mi BD
//mi path contiene mi mysql(la cadena de conexion), root=nombre del usuario,
//la contrase;a=admin, el @localhost(osea el nombre del servidor) con su puerto
//:3307 y el esquema creado en mi interfaz
const sequelize = new Sequelize(path);//creo la instancia de sequelize

//luego nos autenticamos
// sequelize.authenticate().then(() => {//authenticate nos conecta a la BD, es una promesa
//     //me permite mirar si estoy conectada o no
//     console.log('connected to the database');
// }).catch(err => {
//     console.error('connection error:', err);
// }).finally(() => {
//     sequelize.close();
// });
module.exports = sequelize;//la funcion sequelize es exportada
//para poder usarla en otro lado