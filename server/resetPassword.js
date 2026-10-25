
require("dotenv").config();
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const readline = require("readline");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter a new password (minimum 8 characters): ", async (password) => {
  try {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email",
      [hash, "test@example.com"]
    );

    if (result.rowCount === 0) {
      console.log("Account not found: test@example.com");
    } else {
      console.log("Password reset successfully for:", result.rows[0].email);
    }
  } catch (error) {
    console.error("Reset failed:", error.message);
  } finally {
    rl.close();
    await pool.end();
  }
});
