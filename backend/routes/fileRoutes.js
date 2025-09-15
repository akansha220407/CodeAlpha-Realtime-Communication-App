const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile, getFiles } = require('../controllers/fileController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/upload', verifyToken, uploadFile);
router.get('/download/:filename', verifyToken, downloadFile);
router.get('/list', verifyToken, getFiles);

module.exports = router;
