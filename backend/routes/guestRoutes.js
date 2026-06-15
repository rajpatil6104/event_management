const express = require("express");
const router = express.Router();
const { initSheet } = require("../utils/googleSheet"); // Kept here
const Guest = require("../models/Guest");
const generateQR = require("../utils/qrGenerator");
const sendEmail = require("../utils/emailSender");
const Attendance = require("../models/Attendance");
const ExcelJS = require("exceljs");
const auth = require("../middleware/auth");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const XLSX = require("xlsx");
const upload = require("../middleware/upload");

const sendAdminVerification = require("../utils/sendAdminVerification");

// NOTE: Removed the global registrationSheet and attendanceSheet declarations that caused the crash.

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const { v4: uuidv4 } = require("uuid");

    const guestId = uuidv4();
    const qrImage = await generateQR(guestId);

    const guest = await Guest.create({
      guestId,
      name,
      email,
      phone,
      qrCode: qrImage,
    });

    // Reusing initSheet correctly inside the asynchronous route scope
    const doc = await initSheet();
    const sheet = doc.sheetsByTitle["Registrations"];

    await sheet.addRow({
      "Guest ID": guestId,
      Name: name,
      Email: email,
      Phone: phone,
      "Registered At": new Date(),
    });

    await sendEmail(email, qrImage, name);

    res.status(201).json({
      success: true,
      guest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  if (!admin.isVerified) {
    return res.status(403).json({
      message: "Admin Not Verified",
    });
  }
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  const token = jwt.sign({ id: admin._id }, "secretkey", { expiresIn: "1d" });

  res.json({ token });
});

router.post("/verify", async (req, res) => {
  try {
    const { guestId } = req.body;
    const guest = await Guest.findOne({ guestId });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR",
      });
    }

    if (guest.attended) {
      return res.status(400).json({
        success: false,
        message: "Already Checked In",
      });
    }

    guest.attended = true;
    await guest.save();

    await Attendance.create({
      guestId: guest.guestId,
      name: guest.name,
      email: guest.email,
    });

    const doc = await initSheet();
    const sheet = doc.sheetsByTitle["Attendance"];

    await sheet.addRow({
      "Guest ID": guest.guestId,
      Name: guest.name,
      Email: guest.email,
      "Entry Time": new Date().toLocaleString("en-IN"),
    });

    res.json({
      success: true,
      message: "Entry Allowed",
      guest,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/resend/:id", auth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        message: "Guest Not Found",
      });
    }

    const qrImage = await generateQR(guest.guestId);
    await sendEmail(guest.email, qrImage, guest.name);

    res.json({
      message: "QR Sent Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post(
  "/bulk-upload",
  auth,
  upload.single("file"),

  async (req, res) => {
    try {
      const workbook = XLSX.readFile(req.file.path);

      const sheetName = workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const guests = XLSX.utils.sheet_to_json(sheet);

      let success = 0;

      for (const row of guests) {
        const guestId = "EVT-" + Date.now() + Math.floor(Math.random() * 1000);

        const qrImage = await generateQR(guestId);

        const guest = await Guest.create({
          guestId,

          name: row.Name,

          email: row.Email,

          phone: row.Phone,

          qrCode: qrImage,
        });

        const doc = await initSheet();

        const registrationSheet = doc.sheetsByTitle["Registrations"];

        await registrationSheet.addRow({
          "Guest ID": guestId,

          Name: row.Name,

          Email: row.Email,

          Phone: row.Phone,

          "Registered At": new Date().toLocaleString("en-IN"),
        });

        await sendEmail(
          row.Email,

          qrImage,

          row.Name,
        );

        success++;
      }

      res.json({
        success: true,

        uploaded: success,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    }
  },
);

router.post("/register-admin", async (req, res) => {
  const { email, password } = req.body;

  const existing = await Admin.findOne({
    email,
  });

  if (existing) {
    return res.status(400).json({
      message: "Admin Exists",
    });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email,

    password: hashedPassword,

    isVerified: false,

    verificationCode: code,
  });

  await sendAdminVerification(email, code);

  res.json({
    message: "Verification Sent",
  });
});

router.post("/verify-admin", async (req, res) => {
  const { email, code } = req.body;

  const admin = await Admin.findOne({
    email,
  });

  if (!admin) {
    return res.status(404).json({
      message: "Admin Not Found",
    });
  }

  if (admin.verificationCode !== code) {
    return res.status(400).json({
      message: "Wrong Code",
    });
  }

  admin.isVerified = true;

  admin.verificationCode = "";

  await admin.save();

  res.json({
    message: "Verified",
  });
});

router.get("/stats", auth, async (req, res) => {
  const totalGuests = await Guest.countDocuments();
  const attended = await Guest.countDocuments({ attended: true });

  res.json({
    totalGuests,
    attended,
    remaining: totalGuests - attended,
  });
});

router.get("/export", auth, async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");

  sheet.columns = [
    { header: "Guest ID", key: "guestId" },
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Entry Time", key: "entryTime" },
  ];

  const data = await Attendance.find();

  data.forEach((row) => {
    sheet.addRow(row);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");

  await workbook.xlsx.write(res);
  res.end();

  // NOTE: Removed the frontend 'downloadAttendance' code block from here.
  // Place that block in your React/Vue frontend components.
});

router.get("/all", auth, async (req, res) => {
  try {
    const guests = await Guest.find().sort({ _id: -1 });
    res.json(guests);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.delete("/clear-event", auth, async (req, res) => {
  try {
    // Google Sheets
    const doc = await initSheet();
    const registrationSheet = doc.sheetsByTitle["Registrations"];
    const attendanceSheet = doc.sheetsByTitle["Attendance"];

    // Delete Registration rows
    const regRows = await registrationSheet.getRows();
    for (const row of regRows) {
      await row.delete();
    }

    // Delete Attendance rows
    const attRows = await attendanceSheet.getRows();
    for (const row of attRows) {
      await row.delete();
    }

    // MongoDB
    await Guest.deleteMany({});
    await Attendance.deleteMany({});

    res.json({
      success: true,
      message: "Event Data Cleared",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
