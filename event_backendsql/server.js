console.log("🔥🔥 RUNNING THIS SERVER FILE 🔥🔥");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= CONFIG ================= */
const JWT_SECRET = process.env.JWT_SECRET;

/* ================= RAZORPAY ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= FILE UPLOAD ================= */
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static("uploads"));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, "uploads/"),
    filename: (_, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
});

/* ================= AUTH MIDDLEWARE ================= */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

/* ================= DB ================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.log("❌ DB error:", err);
  else console.log("✅ MySQL connected");
});

/* ================= AUTH ================= */
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashed, role],
    (err) => {
      if (err) return res.status(400).json({ message: "User exists" });
      res.json({ message: "Registered" });
    },
  );
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (_, rows) => {
    if (!rows.length) return res.status(401).json({ message: "Invalid" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    });
  });
});

/* ================= EVENTS ================= */
app.get("/api/events", (_, res) => {
  db.query(
    `SELECT id, name, event_date, start_time, end_time, venue,
            max_seats, thumbnail, registration_fee
     FROM events ORDER BY event_date`,
    (_, rows) => res.json(rows),
  );
});

/* ================= EVENT DETAILS ================= */
app.get("/api/events/:id", (req, res) => {
  db.query(
    `SELECT 
      e.id, e.name, e.event_date, e.start_time, e.end_time,
      e.venue, e.description, e.max_seats,
      e.registration_fee, e.thumbnail,
      COUNT(r.id) AS booked_seats
     FROM events e
     LEFT JOIN event_registrations r ON e.id = r.event_id
     WHERE e.id = ?
     GROUP BY e.id`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Fetch failed" });
      if (!rows.length)
        return res.status(404).json({ message: "Event not found" });
      res.json(rows[0]);
    },
  );
});

/* ================= CREATE EVENT (WITH CERT TEMPLATE) ================= */
app.post(
  "/api/events",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "certificateTemplate", maxCount: 1 },
  ]),
  (req, res) => {
    if (req.user.role !== "organizer")
      return res.status(403).json({ message: "Forbidden" });

    const {
      name,
      eventDate,
      startTime,
      endTime,
      venue,
      description,
      maxSeats,
      registrationFee = 0,
    } = req.body;

    const thumbnail = req.files?.thumbnail
      ? `/uploads/${req.files.thumbnail[0].filename}`
      : null;

    const certificateTemplate = req.files?.certificateTemplate
      ? `/uploads/${req.files.certificateTemplate[0].filename}`
      : null;

    const defaultCertificateLayout = {
      studentName: { x: 0, y: 430, align: "center", size: 30 },
      eventName: { x: 0, y: 485, align: "center", size: 18 },
    };

    db.query(
      `INSERT INTO events
     (name,event_date,start_time,end_time,venue,description,
 max_seats,organizer_id,thumbnail,registration_fee,certificate_template,certificate_layout)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        eventDate,
        startTime,
        endTime,
        venue,
        description,
        maxSeats,
        req.user.id,
        thumbnail,
        registrationFee,
        certificateTemplate,
        JSON.stringify(defaultCertificateLayout),
      ],
      (err) => {
        if (err) return res.status(500).json({ message: "Create failed" });
        res.json({ message: "Event created" });
      },
    );
  },
);

/* ================= ORGANIZER ================= */
app.get("/api/organizer/events", auth, (req, res) => {
  if (req.user.role !== "organizer")
    return res.status(403).json({ message: "Forbidden" });

  db.query(
    "SELECT * FROM events WHERE organizer_id=? ORDER BY event_date DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Fetch failed" });
      res.json(rows);
    },
  );
});

app.get("/api/organizer/events/:id/registrations", auth, (req, res) => {
  if (req.user.role !== "organizer")
    return res.status(403).json({ message: "Forbidden" });

  db.query(
    "SELECT student_name, register_no, department, verified FROM event_registrations WHERE event_id=?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Fetch failed" });
      res.json(rows);
    },
  );
});

app.delete("/api/events/:id", auth, (req, res) => {
  if (req.user.role !== "organizer")
    return res.status(403).json({ message: "Forbidden" });

  db.query(
    "DELETE FROM events WHERE id=? AND organizer_id=?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Delete failed" });
      res.json({ message: "Deleted" });
    },
  );
});

app.put(
  "/api/events/:id",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "certificateTemplate", maxCount: 1 },
  ]),
  (req, res) => {
    if (req.user.role !== "organizer")
      return res.status(403).json({ message: "Forbidden" });

    const {
      name,
      eventDate,
      startTime,
      endTime,
      venue,
      description,
      maxSeats,
      registrationFee = 0,
    } = req.body;

    const fields = [
      name,
      eventDate,
      startTime,
      endTime,
      venue,
      description,
      maxSeats,
      registrationFee,
    ];

    let sql = `
      UPDATE events
      SET name=?, event_date=?, start_time=?, end_time=?,
          venue=?, description=?, max_seats=?, registration_fee=?
    `;

    if (req.files?.thumbnail) {
      sql += `, thumbnail=?`;
      fields.push(`/uploads/${req.files.thumbnail[0].filename}`);
    }

    if (req.files?.certificateTemplate) {
      sql += `, certificate_template=?`;
      fields.push(`/uploads/${req.files.certificateTemplate[0].filename}`);
    }

    sql += ` WHERE id=? AND organizer_id=?`;
    fields.push(req.params.id, req.user.id);

    db.query(sql, fields, (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Event updated" });
    });
  },
);

/* ================= STUDENT ================= */
app.get("/api/student/registrations", auth, (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Forbidden" });

  db.query(
    `SELECT 
       r.reg_code,
       r.verified,
       e.name AS event_name
     FROM event_registrations r
     JOIN events e ON r.event_id = e.id
     WHERE r.user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Fetch failed" });
      res.json(rows);
    },
  );
});

/* ================= CERTIFICATE DOWNLOAD ================= */
/* ================= CERTIFICATE DOWNLOAD (FIXED TEMPLATE) ================= */
app.get("/api/certificate/:regCode", (req, res) => {
  const { regCode } = req.params;

  db.query(
    `
  SELECT 
  r.student_name,
  e.name AS event_name,
  e.certificate_template,
  e.certificate_layout
    FROM event_registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.reg_code = ? AND r.verified = 1
    `,
    [regCode],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(404).send("Certificate not available");

      const { student_name, event_name } = rows[0];
      const layout = rows[0].certificate_layout
        ? JSON.parse(rows[0].certificate_layout)
        : {
            studentName: { x: 0, y: 430, align: "center", size: 30 },
            eventName: { x: 0, y: 485, align: "center", size: 18 },
          };

      const doc = new PDFDocument({ size: "A4", margin: 0 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${student_name}_certificate.pdf"`,
      );

      doc.pipe(res);

      // ===== PAGE CONSTANTS =====
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

// ===== OUTER BORDER =====
doc
  .lineWidth(3)
  .rect(30, 30, PAGE_WIDTH - 60, PAGE_HEIGHT - 60)
  .stroke("#1f2937");

// ===== INNER BORDER =====
doc
  .lineWidth(1)
  .rect(45, 45, PAGE_WIDTH - 90, PAGE_HEIGHT - 90)
  .stroke("#9ca3af");

// ===== HEADER =====
doc
  .font("Times-Bold")
  .fontSize(26)
  .fillColor("#111827")
  .text("CERTIFICATE OF PARTICIPATION", 0, 120, {
    align: "center",
  });

// ===== SUBTITLE =====
doc
  .font("Times-Roman")
  .fontSize(14)
  .fillColor("#374151")
  .text("This is to certify that", 0, 180, {
    align: "center",
  });

// ===== STUDENT NAME =====
doc
  .font("Times-Bold")
  .fontSize(32)
  .fillColor("#000000")
  .text(student_name.toUpperCase(), 0, 230, {
    align: "center",
  });

// ===== DIVIDER LINE =====
doc
  .moveTo(150, 280)
  .lineTo(PAGE_WIDTH - 150, 280)
  .stroke("#6b7280");

// ===== EVENT TEXT =====
doc
  .font("Times-Roman")
  .fontSize(16)
  .fillColor("#374151")
  .text(
    `has successfully participated in the event`,
    0,
    320,
    { align: "center" }
  );

// ===== EVENT NAME =====
doc
  .font("Times-Bold")
  .fontSize(20)
  .fillColor("#111827")
  .text(`"${event_name}"`, 0, 360, {
    align: "center",
  });

// ===== FOOTER =====
doc
  .fontSize(12)
  .fillColor("#6b7280")
  .text(
    "This certificate is system generated and does not require a signature.",
    0,
    720,
    { align: "center" }
  );

// ===== CERTIFICATE ID =====
doc
  .fontSize(10)
  .fillColor("#9ca3af")
  .text(`Certificate ID: ${regCode}`, 50, 780);

      /* === FIXED INDUSTRIAL TEMPLATE === */
      const templatePath = rows[0].certificate_template
        ? path.join(__dirname, rows[0].certificate_template)
        : path.join(__dirname, "assets", "certificate_template.png");

      if (fs.existsSync(templatePath)) {
        //doc.image(templatePath, 0, 0, { width: 595, height: 842 });
      }

      /* === TEXT OVERLAY (PRECISE POSITIONING) === */

      // Student Name (Primary Focus)
      doc
        .font("Helvetica-Bold")
        .fontSize(layout.studentName.size)
        .text(student_name, layout.studentName.x, layout.studentName.y, {
          align: layout.studentName.align,
        });

      doc
        .font("Helvetica")
        .fontSize(layout.eventName.size)
        .text(
          `For participating in "${event_name}"`,
          layout.eventName.x,
          layout.eventName.y,
          { align: layout.eventName.align },
        );

      // Event Name
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#374151")
        .text(`For participating in "${event_name}"`, 0, 485, {
          align: "center",
        });

      // Footer Line
      doc
        .fontSize(12)
        .fillColor("#6B7280")
        .text(
          "This certificate is system generated and does not require a signature.",
          0,
          760,
          { align: "center" },
        );

      doc.end();
    },
  );
});

/* ================= QR VERIFY ================= */
app.get("/api/verify/:code", (req, res) => {
  db.query(
    "UPDATE event_registrations SET verified=1 WHERE reg_code=?",
    [req.params.code],
    () => res.send("<h2>Attendance Verified ✅</h2>"),
  );
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ================= PAYMENT ORDER ================= */
app.post("/api/events/:id/create-payment-order", auth, (req, res) => {
  db.query(
    `SELECT 
      e.registration_fee,
      e.max_seats,
      COUNT(r.id) AS usedSeats
     FROM events e
     LEFT JOIN event_registrations r ON e.id = r.event_id
     WHERE e.id = ?
     GROUP BY e.id`,
    [req.params.id],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(404).json({ message: "Event not found" });

      const { registration_fee, max_seats, usedSeats } = rows[0];

      if (max_seats > 0 && usedSeats >= max_seats)
        return res.status(403).json({ message: "Event is full" });

      if (registration_fee <= 0)
        return res.status(400).json({ message: "Free event" });

      razorpay.orders.create(
        {
          amount: registration_fee * 100,
          currency: "INR",
        },
        (err, order) => {
          if (err) return res.status(500).json({ message: "Razorpay error" });

          res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
          });
        },
      );
    },
  );
});

app.post(
  "/api/events/:id/verify-payment-and-register",
  auth,
  async (req, res) => {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      studentName,
      registerNo,
      department,
    } = req.body;

    if (razorpay_signature !== "FREE") {
      const sign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (sign !== razorpay_signature)
        return res.status(400).json({ message: "Invalid signature" });
    }

    const regCode = uuidv4();

    db.query(
      "SELECT id FROM event_registrations WHERE event_id=? AND user_id=?",
      [req.params.id, req.user.id],
      (_, exists) => {
        if (exists.length)
          return res.status(400).json({ message: "Already registered" });

        db.query(
          `INSERT INTO event_registrations
           (event_id,user_id,student_name,register_no,department,reg_code,payment_id)
           VALUES (?,?,?,?,?,?,?)`,
          [
            req.params.id,
            req.user.id,
            studentName,
            registerNo,
            department,
            regCode,
            razorpay_payment_id,
          ],
          async () => {
            const qr = await QRCode.toDataURL(
              `${process.env.BASE_URL}/api/verify/${regCode}`,
            );
            res.json({ qrDataUrl: qr });
          },
        );
      },
    );
  },
);

/* ================= DELETE ACCOUNT ================= */
app.delete("/api/account", auth, (req, res) => {
  const userId = req.user.id;

  // Remove registrations first (FK safety)
  db.query(
    "DELETE FROM event_registrations WHERE user_id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Cleanup failed" });

      db.query("DELETE FROM users WHERE id = ?", [userId], (err2) => {
        if (err2) return res.status(500).json({ message: "Delete failed" });

        res.json({ message: "Account deleted" });
      });
    },
  );
});

/* ================= CHANGE PASSWORD ================= */
app.put("/api/account/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    "SELECT password FROM users WHERE id = ?",
    [req.user.id],
    async (err, rows) => {
      if (err || !rows.length)
        return res.status(400).json({ message: "User not found" });

      const match = await bcrypt.compare(currentPassword, rows[0].password);

      if (!match)
        return res.status(401).json({ message: "Incorrect current password" });

      const hashed = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashed, req.user.id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Update failed" });

          res.json({ message: "Password updated successfully" });
        },
      );
    },
  );
});

/* ================= SERVER ================= */
app.listen(5001, "0.0.0.0", () => {
  console.log("✅ Backend running on port 5001");
});
