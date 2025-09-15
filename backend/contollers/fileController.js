const multer = require('multer');
const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const config = require('../config');

if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).single('file');

exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Encrypt file content
    const filePath = path.join(config.UPLOAD_DIR, req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    const encrypted = CryptoJS.AES.encrypt(fileBuffer.toString('base64'), config.ENCRYPTION_KEY).toString();
    fs.writeFileSync(filePath, encrypted);

    res.json({ filename: req.file.filename, originalName: req.file.originalname, size: req.file.size });
  });
};

exports.downloadFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(config.UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    const encrypted = fs.readFileSync(filePath, 'utf8');
    const decrypted = CryptoJS.AES.decrypt(encrypted, config.ENCRYPTION_KEY);
    const buffer = Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), 'base64');

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch {
    res.status(500).json({ error: 'Download failed' });
  }
};

exports.getFiles = (req, res) => {
  fs.readdir(config.UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read files' });

    const fileList = files.map(file => ({
      filename: file,
      path: `/api/files/download/${file}`,
      uploadedAt: fs.statSync(path.join(config.UPLOAD_DIR, file)).mtime
    }));

    res.json({ files: fileList });
  });
};
