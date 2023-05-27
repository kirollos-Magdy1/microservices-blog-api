import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: "blog-app",
  })
  .promise();

/*
const result = await pool.query("select * from blogs");
console.log(result[0]);
*/
export default pool;
