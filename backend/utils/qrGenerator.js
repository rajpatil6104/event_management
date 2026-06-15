

const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const generateQR = async (guestId) => {
  // 1. Target the 'backend/QR_images' folder explicitly
  // Assuming this file is inside 'backend/utils/' or 'backend/services/',
  // we navigate to the root of 'backend' and target 'QR_images'
  const dirPath = path.resolve(__dirname, "..", "QR_images");

  // 2. Safely create the folder if it doesn't exist yet
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 3. Define the full path for the file
  const filePath = path.join(dirPath, `${guestId}.png`);

  // 4. Save the file to the backend/QR_images folder
  await QRCode.toFile(filePath, guestId);

  // 5. Generate and return the data URL
  const qrImage = await QRCode.toDataURL(guestId);

  return qrImage;
};

module.exports = generateQR;
