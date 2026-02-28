const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/club/:club', fileController.getClubFiles);
router.get('/download/:id', fileController.getFile);
router.delete('/:id', fileController.deleteFile);
router.post('/folder', fileController.createFolder);
router.get('/usage/:club', fileController.getStorageUsage);
router.patch('/:id', fileController.updateFileMetadata);

module.exports = router;
