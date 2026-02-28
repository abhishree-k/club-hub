const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Registration = require('./Registration');
const ClubMembership = require('./ClubMembership');
const Feedback = require('./Feedback');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');
const Certificate = require('./Certificate');

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

// Certificate Associations
Event.hasMany(Certificate, { foreignKey: 'eventId' });
Certificate.belongsTo(Event, { foreignKey: 'eventId' });

User.hasMany(Certificate, { foreignKey: 'userId' });
Certificate.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Event, Registration, ClubMembership, Feedback, BlogPost, Comment, Certificate };
