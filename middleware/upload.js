const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = {
  voice_complaints: './Uploads/voice_complaints',
  profile_pictures: './Uploads/profile_pictures',
  attachments: './Uploads/attachments',
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'voice_file') cb(null, uploadDirs.voice_complaints);
    else if (file.fieldname === 'profile_picture') cb(null, uploadDirs.profile_pictures);
    else if (file.fieldname === 'attachment') cb(null, uploadDirs.attachments);
    else cb(null, './Uploads'); // fallback
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// Field-specific file filter
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const voiceExts = /webm|ogg|mp3|mp4/;
    const attachmentExts = /jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx/;
    const imageExts = /jpeg|jpg|png|webp/;

    const ext = path.extname(file.originalname).slice(1).toLowerCase(); // remove dot

    switch (file.fieldname) {
      case 'voice_file':
        if (voiceExts.test(ext)) return cb(null, true);
        return cb(new Error(`Invalid voice file extension: .${ext}`));

      case 'attachment':
        if (attachmentExts.test(ext)) return cb(null, true);
        return cb(new Error(`Invalid attachment file extension: .${ext}`));

      case 'profile_picture':
        if (imageExts.test(ext)) return cb(null, true);
        return cb(new Error(`Invalid profile picture extension: .${ext}`));

      default:
        return cb(new Error(`Unknown field: ${file.fieldname}`));
    }
  },
});

module.exports = upload;
