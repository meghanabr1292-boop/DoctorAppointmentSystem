const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "MYSQL8",
    database: "doctor_appointment",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;