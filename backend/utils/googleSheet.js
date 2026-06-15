const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library"); // Required for v4 authentication

const creds = require("../config/service-account.json");
const SHEET_ID = "1hVqHfAQDPTX9-MPgr5gN0A53L98JCV-7AQu6DlNtAxI";

// 1. Initialize the JWT authentication object first
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file", // Useful if you need to manage file permissions
  ],
});

// 2. Pass both the SHEET_ID and the auth object into the constructor
const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

async function initSheet() {
  // 3. doc.useServiceAccountAuth(creds) is removed.
  // You only need to load the document info now.
  await doc.loadInfo();

  return doc;
}

module.exports = { initSheet };
