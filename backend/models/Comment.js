const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false, // the text of the comment
    },

    authorName: {
      type: DataTypes.STRING,
      allowNull: false, // name of the author
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'blog_posts', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    status: {
      type: DataTypes.ENUM('active', 'deleted', 'hidden'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true, // soft delete
    indexes: [
      { fields: ['userId'] },
      { fields: ['postId'] },
      { fields: ['status'] },
    ],
  }
);

// auto handle deletion timestamp when status changes
Comment.addHook('beforeUpdate', (comment) => {
  if (comment.changed('status') && comment.status === 'deleted') {
    comment.deletedAt = new Date();
  }
});

module.exports = Comment;
