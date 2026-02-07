const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    authorName: { type: DataTypes.STRING, allowNull: false }, // Store name for display
    imageUrl: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.TEXT, allowNull: true }, // Stored as comma-separated string
    likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING, defaultValue: 'General' }
});

module.exports = BlogPost;
