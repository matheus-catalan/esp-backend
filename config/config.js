require('dotenv').config();

module.exports = {
  development: {
    username: 'esp',
    password: 'esp',
    database: 'backend',
    host: 'db-back',
    dialect: 'postgres',
    port: 5435,
    logging: false
  },

  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    logging: false
  },
};
