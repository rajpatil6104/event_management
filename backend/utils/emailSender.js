const nodemailer = require("nodemailer");

const sendEmail = async (email, qrImage, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Event Entry QR Code",

    html: `
      <h2>Hello ${name}</h2>
      <p>Your QR Code is attached below.</p>
    `,

    attachments: [
      {
        filename: "event-qr.png",
        content: base64Data,
        encoding: "base64",
      },
    ],
  });
};

module.exports = sendEmail;
