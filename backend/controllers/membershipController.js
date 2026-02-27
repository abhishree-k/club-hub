const { ClubMembership, ClubSettings, User } = require('../models');

const createMembershipApplication = async (req, res) => {
  try {
    const { studentId, club, applicationAnswers } = req.body;

    const existingMembership = await ClubMembership.findOne({
      where: { studentId, club }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'Already a member or application pending' });
    }

    const clubSettings = await ClubSettings.findOne({ where: { club } });
    
    let membershipType = 'Member';
    let accessLevel = 1;
    let status = 'Pending';

    if (clubSettings && clubSettings.membershipType === 'public') {
      status = 'Active';
    }

    const membership = await ClubMembership.create({
      studentId,
      club,
      status,
      membershipType,
      accessLevel,
      applicationAnswers: JSON.stringify(applicationAnswers),
      approvalStage: 1,
      joinedAt: status === 'Active' ? new Date() : null
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingApplications = async (req, res) => {
  try {
    const { club } = req.params;

    const applications = await ClubMembership.findAll({
      where: { club, status: 'Pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, approvalNotes, membershipType } = req.body;

    const membership = await ClubMembership.findByPk(id);
    if (!membership) {
      return res.status(404).json({ error: 'Membership application not found' });
    }

    const clubSettings = await ClubSettings.findOne({ where: { club: membership.club } });
    const totalStages = clubSettings ? clubSettings.approvalStages : 1;

    if (membership.approvalStage >= totalStages) {
      await membership.update({
        status: 'Active',
        joinedAt: new Date(),
        approvedBy,
        approvalNotes,
        membershipType: membershipType || 'Member'
      });
    } else {
      await membership.update({
        approvalStage: membership.approvalStage + 1,
        approvedBy,
        approvalNotes
      });
    }

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, rejectionReason } = req.body;

    const membership = await ClubMembership.findByPk(id);
    if (!membership) {
      return res.status(404).json({ error: 'Membership application not found' });
    }

    await membership.update({
      status: 'Rejected',
      approvedBy,
      approvalNotes: rejectionReason
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClubSettings = async (req, res) => {
  try {
    const { club } = req.params;

    let settings = await ClubSettings.findOne({ where: { club } });

    if (!settings) {
      settings = await ClubSettings.create({
        club,
        membershipType: 'public',
        applicationQuestions: [],
        approvalStages: 1,
        allowSelfJoin: true,
        requireApplication: false
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateClubSettings = async (req, res) => {
  try {
    const { club } = req.params;
    const settings = req.body;

    let clubSettings = await ClubSettings.findOne({ where: { club } });

    if (clubSettings) {
      await clubSettings.update(settings);
    } else {
      clubSettings = await ClubSettings.create({
        club,
        ...settings
      });
    }

    res.json(clubSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { studentId, club, invitedBy, membershipType } = req.body;

    const existingMembership = await ClubMembership.findOne({
      where: { studentId, club }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'Already a member' });
    }

    const membership = await ClubMembership.create({
      studentId,
      club,
      status: 'Active',
      membershipType: membershipType || 'Member',
      accessLevel: 1,
      approvalStage: 1,
      approvedBy: invitedBy,
      joinedAt: new Date()
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMembershipTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType, accessLevel } = req.body;

    const membership = await ClubMembership.findByPk(id);
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    await membership.update({
      membershipType,
      accessLevel
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserMemberships = async (req, res) => {
  try {
    const { userId } = req.params;

    const memberships = await ClubMembership.findAll({
      where: { studentId: userId },
      include: [{
        model: ClubSettings,
        as: 'clubSettings'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMembershipApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  getClubSettings,
  updateClubSettings,
  inviteMember,
  updateMembershipTier,
  getUserMemberships
};
