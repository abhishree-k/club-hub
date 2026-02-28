const { Resource, ResourceDownload, User } = require('../models');
const { Op } = require('sequelize');

class ResourceController {
  async uploadResource(req, res) {
    try {
      const { club, uploadedBy, title, description, fileType, fileUrl, fileSize, fileName, category, tags, parentResourceId, accessLevel } = req.body;

      const resource = await Resource.create({
        club,
        uploadedBy,
        title,
        description,
        fileType,
        fileUrl,
        fileSize,
        fileName,
        category,
        tags: tags || [],
        version: parentResourceId ? '2.0' : '1.0',
        parentResourceId,
        accessLevel: accessLevel || 'members'
      });

      res.status(201).json({
        success: true,
        data: resource,
        message: 'Resource uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getResources(req, res) {
    try {
      const { club, fileType, category, tag, accessLevel, uploadedBy } = req.query;
      const where = {};

      if (club) where.club = club;
      if (fileType) where.fileType = fileType;
      if (category) where.category = category;
      if (accessLevel) where.accessLevel = accessLevel;
      if (uploadedBy) where.uploadedBy = uploadedBy;

      let resources = await Resource.findAll({
        where,
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: ResourceDownload,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ],
        order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
      });

      if (tag) {
        resources = resources.filter(res => res.tags && res.tags.includes(tag));
      }

      res.status(200).json({ success: true, data: resources });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getResourceById(req, res) {
    try {
      const { id } = req.params;

      const resource = await Resource.findByPk(id, {
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Resource,
            as: 'versions',
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: ResourceDownload,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ]
      });

      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      res.status(200).json({ success: true, data: resource });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async searchResources(req, res) {
    try {
      const { query, club } = req.query;
      const where = {};

      if (club) where.club = club;

      if (query) {
        const { Op } = require('sequelize');
        where[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ];
      }

      const resources = await Resource.findAll({
        where,
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({ success: true, data: resources });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateResource(req, res) {
    try {
      const { id } = req.params;
      const { title, description, category, tags, accessLevel, isPinned } = req.body;

      const resource = await Resource.findByPk(id);
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      if (title) resource.title = title;
      if (description !== undefined) resource.description = description;
      if (category !== undefined) resource.category = category;
      if (tags !== undefined) resource.tags = tags;
      if (accessLevel) resource.accessLevel = accessLevel;
      if (isPinned !== undefined) resource.isPinned = isPinned;

      await resource.save();

      res.status(200).json({
        success: true,
        data: resource,
        message: 'Resource updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteResource(req, res) {
    try {
      const { id } = req.params;

      const resource = await Resource.findByPk(id);
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      await ResourceDownload.destroy({ where: { resourceId: id } });
      await Resource.destroy({ where: { parentResourceId: id } });
      await resource.destroy();

      res.status(200).json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async downloadResource(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const resource = await Resource.findByPk(id);
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      const download = await ResourceDownload.create({
        resourceId: id,
        userId
      });

      resource.downloadCount += 1;
      await resource.save();

      res.status(200).json({
        success: true,
        data: {
          resource,
          download
        },
        message: 'Download recorded successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDownloads(req, res) {
    try {
      const { resourceId, userId } = req.query;
      const where = {};

      if (resourceId) where.resourceId = resourceId;
      if (userId) where.userId = userId;

      const downloads = await ResourceDownload.findAll({
        where,
        include: [
          {
            model: Resource,
            include: [
              {
                model: User,
                as: 'uploader',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [['downloadedAt', 'DESC']]
      });

      res.status(200).json({ success: true, data: downloads });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDownloadStats(req, res) {
    try {
      const { club, startDate, endDate } = req.query;
      const where = {};

      if (startDate || endDate) {
        where.downloadedAt = {};
        if (startDate) where.downloadedAt[Op.gte] = new Date(startDate);
        if (endDate) where.downloadedAt[Op.lte] = new Date(endDate);
      }

      const downloads = await ResourceDownload.findAll({
        where,
        include: [
          {
            model: Resource,
            where: club ? { club } : {},
            attributes: ['id', 'title', 'category', 'fileType']
          },
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['downloadedAt', 'DESC']]
      });

      const stats = {
        totalDownloads: downloads.length,
        downloadsByResource: {},
        downloadsByCategory: {},
        downloadsByFileType: {},
        downloadsByUser: {}
      };

      downloads.forEach(download => {
        const resourceTitle = download.Resource?.title || 'Unknown';
        const category = download.Resource?.category || 'Uncategorized';
        const fileType = download.Resource?.fileType || 'other';
        const userName = download.User ? `${download.User.firstName} ${download.User.lastName}` : 'Unknown';

        stats.downloadsByResource[resourceTitle] = (stats.downloadsByResource[resourceTitle] || 0) + 1;
        stats.downloadsByCategory[category] = (stats.downloadsByCategory[category] || 0) + 1;
        stats.downloadsByFileType[fileType] = (stats.downloadsByFileType[fileType] || 0) + 1;
        stats.downloadsByUser[userName] = (stats.downloadsByUser[userName] || 0) + 1;
      });

      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async pinResource(req, res) {
    try {
      const { id } = req.params;
      const { isPinned } = req.body;

      const resource = await Resource.findByPk(id);
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      resource.isPinned = isPinned;
      await resource.save();

      res.status(200).json({
        success: true,
        data: resource,
        message: isPinned ? 'Resource pinned successfully' : 'Resource unpinned successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ResourceController();
