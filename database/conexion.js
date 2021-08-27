const Sequelize = require('sequelize');
const path = 'mysql://root:@localhost:3306/delilah_resto';
const sequelize = new Sequelize(path);
module.exports = sequelize;