
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const authenticateToken = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
app.locals.pool = pool;

app.use("/api/leads", require("./routes/leads"));

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Lead Management API is running" });
});

// Database test
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );
    res.json({
      message: "Database connected successfully",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [cleanName, cleanEmail, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Could not register user",
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Could not log in",
    });
  }
});

// Protected: current user
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User account no longer exists",
      });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("User lookup error:", error.message);
    return res.status(500).json({
      message: "Could not retrieve user",
    });
  }
});


app.get(
  "/api/dashboard/stats",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          COUNT(*)::int AS total_leads,
          COUNT(*) FILTER (WHERE status = 'New')::int AS new_leads,
          COUNT(*) FILTER (WHERE status = 'Contacted')::int AS contacted_leads,
          COUNT(*) FILTER (WHERE status = 'Qualified')::int AS qualified_leads,
          COUNT(*) FILTER (WHERE status = 'Converted')::int AS converted_leads,
          COUNT(*) FILTER (WHERE status = 'Lost')::int AS lost_leads
         FROM leads
         WHERE user_id = $1`,
        [req.user.id]
      );

      res.json({ stats: result.rows[0] });
    } catch (error) {
      console.error("Dashboard stats error:", error.message);
      res.status(500).json({
        message: "Could not retrieve dashboard statistics",
      });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
