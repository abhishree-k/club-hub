const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Registration = require('./Registration');
const ClubMembership = require('./ClubMembership');
const Feedback = require('./Feedback');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');

// Associations
User.hasMany(Registration);
Registration.belongsTo(User);

Event.hasMany(Registration);
Registration.belongsTo(Event);

User.belongsToMany(Event, { through: Registration });
Event.belongsToMany(User, { through: Registration });

User.hasMany(ClubMembership);
ClubMembership.belongsTo(User);

// Blog Associations
User.hasMany(BlogPost);
BlogPost.belongsTo(User);

BlogPost.hasMany(Comment);
Comment.belongsTo(BlogPost);

User.hasMany(Comment);
Comment.belongsTo(User);

module.exports = { sequelize, User, Event, Registration, ClubMembership, Feedback, BlogPost, Comment };
