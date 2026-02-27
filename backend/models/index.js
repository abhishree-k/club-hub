const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Registration = require('./Registration');
const ClubMembership = require('./ClubMembership');
const Feedback = require('./Feedback');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');
const FeedPost = require('./FeedPost');
const FeedReaction = require('./FeedReaction');
const FeedComment = require('./FeedComment');

// Associations (explicit foreignKey to avoid duplicate column errors)
User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Registration, { foreignKey: 'eventId' });
Registration.belongsTo(Event, { foreignKey: 'eventId' });

User.belongsToMany(Event, { through: Registration, foreignKey: 'userId' });
Event.belongsToMany(User, { through: Registration, foreignKey: 'eventId' });

User.hasMany(ClubMembership, { foreignKey: 'studentId' });
ClubMembership.belongsTo(User, { foreignKey: 'studentId' });

// Blog Associations
User.hasMany(BlogPost);
BlogPost.belongsTo(User);

BlogPost.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(BlogPost, { foreignKey: 'postId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Feed Associations
User.hasMany(FeedPost, { foreignKey: 'userId' });
FeedPost.belongsTo(User, { foreignKey: 'userId' });

FeedPost.hasMany(FeedReaction, { foreignKey: 'postId' });
FeedReaction.belongsTo(FeedPost, { foreignKey: 'postId' });

User.hasMany(FeedReaction, { foreignKey: 'userId' });
FeedReaction.belongsTo(User, { foreignKey: 'userId' });

FeedPost.hasMany(FeedComment, { foreignKey: 'postId' });
FeedComment.belongsTo(FeedPost, { foreignKey: 'postId' });

User.hasMany(FeedComment, { foreignKey: 'userId' });
FeedComment.belongsTo(User, { foreignKey: 'userId' });

FeedComment.hasMany(FeedComment, { as: 'replies', foreignKey: 'parentCommentId' });
FeedComment.belongsTo(FeedComment, { as: 'parent', foreignKey: 'parentCommentId' });

module.exports = { sequelize, User, Event, Registration, ClubMembership, Feedback, BlogPost, Comment, FeedPost, FeedReaction, FeedComment };
