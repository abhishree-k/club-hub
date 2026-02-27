const { FeedPost, FeedReaction, FeedComment, User } = require('../models');
const { Op } = require('sequelize');

class FeedController {
  async createPost(req, res) {
    try {
      const { club, userId, content, mediaUrls, hashtags, mentions } = req.body;

      const mediaType = mediaUrls && mediaUrls.length > 0
        ? (mediaUrls.length > 1 ? 'mixed' : mediaUrls[0].match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image')
        : 'text';

      const post = await FeedPost.create({
        club,
        userId,
        content,
        mediaType,
        mediaUrls: mediaUrls || [],
        hashtags: hashtags || [],
        mentions: mentions || []
      });

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPosts(req, res) {
    try {
      const { club, userId, mediaType, hashtag, moderationStatus } = req.query;
      const where = {};

      if (club) where.club = club;
      if (userId) where.userId = userId;
      if (mediaType) where.mediaType = mediaType;
      if (moderationStatus) where.moderationStatus = moderationStatus;

      let posts = await FeedPost.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: FeedReaction,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          },
          {
            model: FeedComment,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          }
        ],
        order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
      });

      if (hashtag) {
        posts = posts.filter(post => post.hashtags && post.hashtags.includes(hashtag));
      }

      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPostById(req, res) {
    try {
      const { id } = req.params;

      const post = await FeedPost.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: FeedReaction,
            include: [{ model: User, attributes: ['firstName', 'lastName'] }]
          },
          {
            model: FeedComment,
            include: [
              { model: User, attributes: ['firstName', 'lastName'] },
              {
                model: FeedComment,
                as: 'replies',
                include: [{ model: User, attributes: ['firstName', 'lastName'] }]
              }
            ]
          }
        ]
      });

      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { content, mediaUrls, hashtags, mentions } = req.body;

      const post = await FeedPost.findByPk(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      if (content !== undefined) post.content = content;
      if (mediaUrls !== undefined) post.mediaUrls = mediaUrls;
      if (hashtags !== undefined) post.hashtags = hashtags;
      if (mentions !== undefined) post.mentions = mentions;

      if (mediaUrls) {
        post.mediaType = mediaUrls.length > 0
          ? (mediaUrls.length > 1 ? 'mixed' : mediaUrls[0].match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image')
          : 'text';
      }

      await post.save();

      res.status(200).json({
        success: true,
        data: post,
        message: 'Post updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;

      const post = await FeedPost.findByPk(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      await FeedReaction.destroy({ where: { postId: id } });
      await FeedComment.destroy({ where: { postId: id } });
      await post.destroy();

      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async reactToPost(req, res) {
    try {
      const { postId, userId, reactionType } = req.body;

      const post = await FeedPost.findByPk(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const existingReaction = await FeedReaction.findOne({
        where: { postId, userId }
      });

      if (existingReaction) {
        if (existingReaction.reactionType === reactionType) {
          await existingReaction.destroy();
          post.likes = Math.max(0, post.likes - 1);
        } else {
          existingReaction.reactionType = reactionType;
          await existingReaction.save();
        }
      } else {
        await FeedReaction.create({ postId, userId, reactionType });
        post.likes += 1;
      }

      await post.save();

      res.status(200).json({
        success: true,
        data: post,
        message: 'Reaction updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async commentOnPost(req, res) {
    try {
      const { postId, userId, content, parentCommentId } = req.body;

      const post = await FeedPost.findByPk(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      const comment = await FeedComment.create({
        postId,
        userId,
        content,
        parentCommentId
      });

      post.comments += 1;
      await post.save();

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getComments(req, res) {
    try {
      const { postId } = req.params;

      const comments = await FeedComment.findAll({
        where: { postId, parentCommentId: null },
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: FeedComment,
            as: 'replies',
            include: [
              { model: User, attributes: ['firstName', 'lastName', 'email'] }
            ]
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const comment = await FeedComment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      comment.content = content;
      comment.isEdited = true;
      await comment.save();

      res.status(200).json({
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await FeedComment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      const post = await FeedPost.findByPk(comment.postId);
      if (post) {
        post.comments = Math.max(0, post.comments - 1);
        await post.save();
      }

      await FeedComment.destroy({ where: { parentCommentId: id } });
      await comment.destroy();

      res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async pinPost(req, res) {
    try {
      const { id } = req.params;
      const { isPinned } = req.body;

      const post = await FeedPost.findByPk(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      post.isPinned = isPinned;
      await post.save();

      res.status(200).json({
        success: true,
        data: post,
        message: isPinned ? 'Post pinned successfully' : 'Post unpinned successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async moderatePost(req, res) {
    try {
      const { id } = req.params;
      const { moderationStatus } = req.body;

      const post = await FeedPost.findByPk(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      post.moderationStatus = moderationStatus;
      post.isModerated = moderationStatus !== 'approved';
      await post.save();

      res.status(200).json({
        success: true,
        data: post,
        message: 'Post moderation status updated'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getActivityTimeline(req, res) {
    try {
      const { club, userId, limit } = req.query;

      const posts = await FeedPost.findAll({
        where: club ? { club } : {},
        limit: limit ? parseInt(limit) : 50,
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const timeline = posts.map(post => ({
        type: 'post',
        id: post.id,
        user: post.User,
        club: post.club,
        content: post.content,
        mediaType: post.mediaType,
        createdAt: post.createdAt
      }));

      res.status(200).json({ success: true, data: timeline });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new FeedController();
