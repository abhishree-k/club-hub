const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Registration = require('./Registration');
const ClubMembership = require('./ClubMembership');
const Feedback = require('./Feedback');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');
const MembershipFee = require('./MembershipFee');
const EventTicket = require('./EventTicket');
const Donation = require('./Donation');

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

// Payment associations
User.hasMany(MembershipFee, { foreignKey: 'studentId' });
MembershipFee.belongsTo(User, { foreignKey: 'studentId' });

User.hasMany(EventTicket, { foreignKey: 'userId' });
EventTicket.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(EventTicket, { foreignKey: 'eventId' });
EventTicket.belongsTo(Event, { foreignKey: 'eventId' });

User.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'donorId', as: 'donor' });

module.exports = { sequelize, User, Event, Registration, ClubMembership, Feedback, BlogPost, Comment, MembershipFee, EventTicket, Donation };
