const Sequelize = require('sequelize');
const path = 'mysql://root:admin@localhost:3307/delilah_resto';
const sequelize = new Sequelize(path);
module.exports = sequelize;