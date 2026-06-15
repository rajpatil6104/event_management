const nodemailer = require("nodemailer");

const sendAdminVerification = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,

      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: process.env.ADMIN_EMAIL,

    subject: "New Admin Registration",

    html: `

  <h2>
   New Admin Request
  </h2>

  <p>
   Email:
   ${email}
  </p>

  <p>
   Code:
   <b>${code}</b>
  </p>

  `,
  });
};

module.exports = sendAdminVerification;
