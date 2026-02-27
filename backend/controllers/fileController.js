const ClubFile = require('../models/ClubFile');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { club, uploadedBy, folder, description, isPublic } = req.body;

    const fileType = getFileType(req.file.mimetype);
    const fileName = `${uuidv4()}-${req.file.originalname}`;

    const file = await ClubFile.create({
      club,
      uploadedBy,
      fileName,
      originalName: req.file.originalname,
      filePath: `/uploads/${fileName}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType,
      folder: folder || '',
      description,
      isPublic: isPublic !== 'false'
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClubFiles = async (req, res) => {
  try {
    const { club } = req.params;
    const { folder, fileType } = req.query;

    const where = { club };
    if (folder) where.folder = folder;
    if (fileType) where.fileType = fileType;

    const files = await ClubFile.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await ClubFile.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await file.increment('downloadCount');

    const filePath = path.join(__dirname, '../..', file.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File does not exist' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await ClubFile.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../..', file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.destroy();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFolder = async (req, res) => {
  try {
    const { club, folderName } = req.body;

    const existingFiles = await ClubFile.findOne({
      where: { club, folder: folderName }
    });

    if (existingFiles) {
      return res.status(400).json({ error: 'Folder already exists' });
    }

    res.status(201).json({ message: 'Folder created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStorageUsage = async (req, res) => {
  try {
    const { club } = req.params;

    const files = await ClubFile.findAll({
      where: { club },
      attributes: ['fileSize']
    });

    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    const fileCount = files.length;

    const usageByType = {};
    files.forEach(file => {
      if (!usageByType[file.fileType]) {
        usageByType[file.fileType] = { count: 0, size: 0 };
      }
      usageByType[file.fileType].count++;
      usageByType[file.fileType].size += file.fileSize;
    });

    res.json({
      totalSize,
      fileCount,
      usageByType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFileMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isPublic, folder } = req.body;

    const file = await ClubFile.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await file.update({
      description: description !== undefined ? description : file.description,
      isPublic: isPublic !== undefined ? isPublic : file.isPublic,
      folder: folder !== undefined ? folder : file.folder
    });

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  getClubFiles,
  getFile,
  deleteFile,
  createFolder,
  getStorageUsage,
  updateFileMetadata
};
