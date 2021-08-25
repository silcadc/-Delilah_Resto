const sequelize = require('./conexion.js');

async function getAllUsers() {
    sequelize.query(
        'SELECT * FROM users',
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (users) {
        return users
    })
    .catch(error => console.log(error))
};

async function insertUsers(userInfo) {
    sequelize.query(
        'INSERT INTO users (`username`, `fullname`, `email`, `telephone`, `address`, `password`, `is_admin`) VALUES(?, ?, ?, ?, ?, ?, ?)',
        {
            replacements: userInfo,
            type: sequelize.QueryTypes.INSERT
        }
    )
    .then(function (users) {
        console.log(`data inserted correctly + ${users}`)
    })
    .catch(error => console.log(error))
};

async function getUserLogin(username, password) {
    sequelize.query(
        `SELECT * FROM users WHERE username = ${username} && password = ${password}`,
        {        
            type: sequelize.QueryTypes.SELECT
        }
    )
    .then(function (user) {
        return user
    })
    .catch(error => console.log(error))
};

module.exports = {getAllUsers, insertUsers, getUserLogin}