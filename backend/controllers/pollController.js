const { Poll, PollVote, User } = require('../models');
const { Op } = require('sequelize');

class PollController {
  async createPoll(req, res) {
    try {
      const { club, createdBy, question, options, isAnonymous, allowMultipleChoice, deadline } = req.body;

      if (!options || options.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Poll must have at least 2 options'
        });
      }

      const poll = await Poll.create({
        club,
        createdBy,
        question,
        options: options.map((opt, index) => ({
          id: index,
          text: opt,
          votes: 0
        })),
        isAnonymous: isAnonymous || false,
        allowMultipleChoice: allowMultipleChoice || false,
        deadline: deadline || null,
        isActive: true,
        totalVotes: 0
      });

      res.status(201).json({
        success: true,
        data: poll,
        message: 'Poll created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPolls(req, res) {
    try {
      const { club, isActive, createdBy } = req.query;
      const where = {};

      if (club) where.club = club;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (createdBy) where.createdBy = createdBy;

      const polls = await Poll.findAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({ success: true, data: polls });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPollById(req, res) {
    try {
      const { id } = req.params;

      const poll = await Poll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['firstName', 'lastName', 'email']
          }
        ]
      });

      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      res.status(200).json({ success: true, data: poll });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async vote(req, res) {
    try {
      const { pollId, userId, selectedOptions } = req.body;

      const poll = await Poll.findByPk(pollId);
      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      if (!poll.isActive) {
        return res.status(400).json({ success: false, error: 'Poll is not active' });
      }

      if (poll.deadline && new Date(poll.deadline) < new Date()) {
        return res.status(400).json({ success: false, error: 'Poll deadline has passed' });
      }

      if (!selectedOptions || selectedOptions.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one option must be selected' });
      }

      if (!poll.allowMultipleChoice && selectedOptions.length > 1) {
        return res.status(400).json({ success: false, error: 'Multiple choices not allowed' });
      }

      const existingVotes = await PollVote.findAll({ where: { pollId, userId } });
      if (existingVotes.length > 0) {
        return res.status(400).json({ success: false, error: 'You have already voted on this poll' });
      }

      const votes = [];
      for (const optionId of selectedOptions) {
        const vote = await PollVote.create({
          pollId,
          userId,
          selectedOption: optionId
        });
        votes.push(vote);
      }

      const updatedOptions = poll.options.map(opt => {
        if (selectedOptions.includes(opt.id)) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      poll.options = updatedOptions;
      poll.totalVotes += votes.length;
      await poll.save();

      res.status(201).json({
        success: true,
        data: { votes, poll },
        message: 'Vote recorded successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPollResults(req, res) {
    try {
      const { id } = req.params;

      const poll = await Poll.findByPk(id, {
        include: [
          {
            model: PollVote,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      const optionsWithPercentages = poll.options.map(opt => ({
        ...opt,
        percentage: poll.totalVotes > 0 ? ((opt.votes / poll.totalVotes) * 100).toFixed(2) : 0
      }));

      const results = {
        pollId: poll.id,
        question: poll.question,
        options: optionsWithPercentages,
        totalVotes: poll.totalVotes,
        votes: poll.isAnonymous ? [] : poll.PollVotes,
        isAnonymous: poll.isAnonymous
      };

      res.status(200).json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserVotes(req, res) {
    try {
      const { userId } = req.params;

      const votes = await PollVote.findAll({
        where: { userId },
        include: [
          {
            model: Poll,
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          }
        ],
        order: [['votedAt', 'DESC']]
      });

      res.status(200).json({ success: true, data: votes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePoll(req, res) {
    try {
      const { id } = req.params;
      const { question, options, isAnonymous, allowMultipleChoice, deadline, isActive } = req.body;

      const poll = await Poll.findByPk(id);
      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      const hasVotes = await PollVote.count({ where: { pollId: id } });
      if (hasVotes > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify poll after votes have been cast'
        });
      }

      if (question) poll.question = question;
      if (options) {
        if (options.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Poll must have at least 2 options'
          });
        }
        poll.options = options.map((opt, index) => ({
          id: index,
          text: opt,
          votes: 0
        }));
      }
      if (isAnonymous !== undefined) poll.isAnonymous = isAnonymous;
      if (allowMultipleChoice !== undefined) poll.allowMultipleChoice = allowMultipleChoice;
      if (deadline !== undefined) poll.deadline = deadline;
      if (isActive !== undefined) poll.isActive = isActive;

      await poll.save();

      res.status(200).json({
        success: true,
        data: poll,
        message: 'Poll updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePoll(req, res) {
    try {
      const { id } = req.params;

      const poll = await Poll.findByPk(id);
      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      await PollVote.destroy({ where: { pollId: id } });
      await poll.destroy();

      res.status(200).json({ success: true, message: 'Poll deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async exportResults(req, res) {
    try {
      const { id } = req.params;
      const { format } = req.query;

      const poll = await Poll.findByPk(id, {
        include: [
          {
            model: PollVote,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!poll) {
        return res.status(404).json({ success: false, error: 'Poll not found' });
      }

      const exportData = {
        pollId: poll.id,
        question: poll.question,
        club: poll.club,
        createdBy: poll.createdBy,
        createdAt: poll.createdAt,
        deadline: poll.deadline,
        isAnonymous: poll.isAnonymous,
        totalVotes: poll.totalVotes,
        options: poll.options.map(opt => ({
          text: opt.text,
          votes: opt.votes,
          percentage: poll.totalVotes > 0 ? ((opt.votes / poll.totalVotes) * 100).toFixed(2) : 0
        })),
        votes: poll.isAnonymous ? [] : poll.PollVotes
      };

      if (format === 'csv') {
        const csvRows = [
          ['Question', poll.question],
          ['Total Votes', poll.totalVotes],
          [],
          ['Option', 'Votes', 'Percentage'],
          ...poll.options.map(opt => [
            opt.text,
            opt.votes,
            `${poll.totalVotes > 0 ? ((opt.votes / poll.totalVotes) * 100).toFixed(2) : 0}%`
          ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="poll_${id}_results.csv"`);
        res.send(csvContent);
      } else {
        res.status(200).json({ success: true, data: exportData });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new PollController();
