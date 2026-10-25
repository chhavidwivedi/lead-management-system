
const express = require("express");

const router = express.Router();
const authenticateToken = require("../middleware/auth");

// GET all leads for the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      from = "",
      to = "",
      page = "1",
      limit = "10",
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const conditions = ["user_id = $1"];
    const values = [req.user.id];

    function addCondition(sql, value) {
      values.push(value);
      conditions.push(sql.replace("?", `$${values.length}`));
    }

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const n = values.length;
      conditions.push(
        `(name ILIKE $${n} OR email ILIKE $${n} OR phone ILIKE $${n})`
      );
    }

    const allowedStatuses = [
      "New", "Contacted", "Qualified", "Converted", "Lost",
    ];

    if (status && allowedStatuses.includes(status)) {
      addCondition("status = ?", status);
    }

    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
  addCondition("follow_up_date >= ?::date", from);
}

if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
  addCondition("follow_up_date <= ?::date", to);
      }
    

    const where = conditions.join(" AND ");
    const offset = (currentPage - 1) * pageSize;

    const countResult = await req.app.locals.pool.query(
      `SELECT COUNT(*)::int AS total FROM leads WHERE ${where}`,
      values
    );

    const result = await req.app.locals.pool.query(
      `SELECT * FROM leads WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, pageSize, offset]
    );

    res.json({
      leads: result.rows,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(
          countResult.rows[0].total / pageSize
        ),
      },
    });
  } catch (error) {
    console.error("List leads error:", error.message);
    res.status(500).json({ message: "Could not retrieve leads" });
  }
});

// GET one lead
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      "SELECT * FROM leads WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ lead: result.rows[0] });
  } catch (error) {
    console.error("Get lead error:", error.message);
    res.status(500).json({ message: "Could not retrieve lead" });
  }
});

// CREATE lead
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      name, email, phone, company,
      service_interested, status, follow_up_date, notes,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Lead name is required" });
    }

    const allowedStatuses = [
      "New", "Contacted", "Qualified", "Converted", "Lost",
    ];

    const leadStatus = status || "New";

    if (!allowedStatuses.includes(leadStatus)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (follow_up_date &&
        !/^\d{4}-\d{2}-\d{2}$/.test(follow_up_date)) {
      return res.status(400).json({
        message: "Follow-up date must use YYYY-MM-DD format",
      });
    }

    const result = await req.app.locals.pool.query(
      `INSERT INTO leads
       (user_id, name, email, phone, company,
        service_interested, status, follow_up_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.id,
        name.trim(),
        email || null,
        phone || null,
        company || null,
        service_interested || null,
        leadStatus,
        follow_up_date || null,
        notes || null,
      ]
    );

    res.status(201).json({
      message: "Lead created successfully",
      lead: result.rows[0],
    });
  } catch (error) {
    console.error("Create lead error:", error.message);
    res.status(500).json({ message: "Could not create lead" });
  }
});

// UPDATE lead
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      name, email, phone, company,
      service_interested, status, follow_up_date, notes,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Lead name is required" });
    }

    const allowedStatuses = [
      "New", "Contacted", "Qualified", "Converted", "Lost",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    if (follow_up_date &&
        !/^\d{4}-\d{2}-\d{2}$/.test(follow_up_date)) {
      return res.status(400).json({
        message: "Follow-up date must use YYYY-MM-DD format",
      });
    }

    const result = await req.app.locals.pool.query(
      `UPDATE leads SET
       name=$1, email=$2, phone=$3, company=$4,
       service_interested=$5, status=$6,
       follow_up_date=$7, notes=$8
       WHERE id=$9 AND user_id=$10
       RETURNING *`,
      [
        name.trim(), email || null, phone || null,
        company || null, service_interested || null,
        status, follow_up_date || null, notes || null,
        req.params.id, req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({
      message: "Lead updated successfully",
      lead: result.rows[0],
    });
  } catch (error) {
    console.error("Update lead error:", error.message);
    res.status(500).json({ message: "Could not update lead" });
  }
});

// DELETE lead
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      "DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error.message);
    res.status(500).json({ message: "Could not delete lead" });
  }
});

module.exports = router;
