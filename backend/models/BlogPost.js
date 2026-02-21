const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
    
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 150]
    }
  },

  slug: {
    type: DataTypes.STRING,
    unique: true
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [20, 50000]
    }
  },

  authorName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },

  tags: {
    type: DataTypes.JSON, // upgrade from comma string
    allowNull: true
  },

  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },

  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  }

}, {
  tableName: 'blog_posts',
  timestamps: true,
  indexes: [
    { fields: ['slug'] },
    { fields: ['category'] },
    { fields: ['createdAt'] }
  ]
});

// ---------- Hooks ----------

BlogPost.beforeValidate((post) => {
  if (post.title) {
    post.title = post.title.trim();
    post.slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (post.authorName) {
    post.authorName = post.authorName.trim();
  }
});

// ---------- Instance Methods ----------

BlogPost.prototype.incrementLikes = async function () {
  this.likesCount += 1;
  return this.save();
};

// ---------- Static Query Helpers ----------

BlogPost.findRecent = function (limit = 10) {
  return this.findAll({
    order: [['createdAt', 'DESC']],
    limit
  });
};

BlogPost.findByCategory = function (category) {
  return this.findAll({
    where: { category }
  });
};

BlogPost.searchByKeyword = function (keyword) {
  return this.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ]
    }
  });
};

module.exports = BlogPost;
