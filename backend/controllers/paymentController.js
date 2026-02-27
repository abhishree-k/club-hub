const { MembershipFee, EventTicket, Donation, User, Event } = require('../models');
const { Op } = require('sequelize');

class PaymentController {
  async processMembershipFee(req, res) {
    try {
      const { studentId, club, amount, paymentMethod, academicYear } = req.body;

      const membershipFee = await MembershipFee.create({
        studentId,
        club,
        amount,
        paymentMethod: paymentMethod || 'stripe',
        academicYear: academicYear || new Date().getFullYear().toString(),
        status: 'completed',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentDate: new Date()
      });

      res.status(201).json({
        success: true,
        data: membershipFee,
        message: 'Membership fee processed successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMembershipFees(req, res) {
    try {
      const { club, academicYear, status } = req.query;
      const where = {};

      if (club) where.club = club;
      if (academicYear) where.academicYear = academicYear;
      if (status) where.status = status;

      const fees = await MembershipFee.findAll({
        where,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
        order: [['paymentDate', 'DESC']]
      });

      res.status(200).json({ success: true, data: fees });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserMembershipFees(req, res) {
    try {
      const { userId } = req.params;

      const fees = await MembershipFee.findAll({
        where: { studentId: userId },
        order: [['paymentDate', 'DESC']]
      });

      res.status(200).json({ success: true, data: fees });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async purchaseEventTicket(req, res) {
    try {
      const { eventId, userId, ticketType, quantity, pricePerTicket, paymentMethod } = req.body;

      const totalAmount = pricePerTicket * quantity;

      const ticket = await EventTicket.create({
        eventId,
        userId,
        ticketType,
        quantity,
        pricePerTicket,
        totalAmount,
        paymentMethod: paymentMethod || 'stripe',
        status: 'confirmed',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        purchaseDate: new Date(),
        qrCode: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Ticket purchased successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEventTickets(req, res) {
    try {
      const { eventId, status } = req.query;
      const where = {};

      if (eventId) where.eventId = eventId;
      if (status) where.status = status;

      const tickets = await EventTicket.findAll({
        where,
        include: [
          { model: User, attributes: ['firstName', 'lastName', 'email'] },
          { model: Event, attributes: ['name', 'club', 'startDate', 'location'] }
        ],
        order: [['purchaseDate', 'DESC']]
      });

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserTickets(req, res) {
    try {
      const { userId } = req.params;

      const tickets = await EventTicket.findAll({
        where: { userId },
        include: [
          { model: Event, attributes: ['name', 'club', 'startDate', 'location'] }
        ],
        order: [['purchaseDate', 'DESC']]
      });

      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async makeDonation(req, res) {
    try {
      const { donorId, club, amount, paymentMethod, isAnonymous, message, campaign } = req.body;

      const donation = await Donation.create({
        donorId: donorId || null,
        club,
        amount,
        paymentMethod: paymentMethod || 'stripe',
        isAnonymous: isAnonymous || false,
        message,
        campaign,
        status: 'completed',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        donationDate: new Date()
      });

      res.status(201).json({
        success: true,
        data: donation,
        message: 'Donation processed successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDonations(req, res) {
    try {
      const { club, campaign, status } = req.query;
      const where = {};

      if (club) where.club = club;
      if (campaign) where.campaign = campaign;
      if (status) where.status = status;

      const donations = await Donation.findAll({
        where,
        include: [
          {
            model: User,
            as: 'donor',
            attributes: ['firstName', 'lastName', 'email'],
            required: false
          }
        ],
        order: [['donationDate', 'DESC']]
      });

      const filteredDonations = donations.filter(d => !d.isAnonymous || d.donorId === null);

      res.status(200).json({ success: true, data: filteredDonations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPaymentReport(req, res) {
    try {
      const { club, startDate, endDate, type } = req.query;
      const where = {};
      const dateFilter = {};

      if (startDate) dateFilter[Op.gte] = new Date(startDate);
      if (endDate) dateFilter[Op.lte] = new Date(endDate);

      let membershipFees = [];
      let eventTickets = [];
      let donations = [];

      if (!type || type === 'membership') {
        const membershipWhere = { ...where };
        if (club) membershipWhere.club = club;
        if (startDate || endDate) membershipWhere.paymentDate = dateFilter;

        membershipFees = await MembershipFee.findAll({
          where: membershipWhere,
          include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
        });
      }

      if (!type || type === 'tickets') {
        const ticketWhere = { ...where };
        if (startDate || endDate) ticketWhere.purchaseDate = dateFilter;

        eventTickets = await EventTicket.findAll({
          where: ticketWhere,
          include: [
            { model: User, attributes: ['firstName', 'lastName', 'email'] },
            { model: Event, attributes: ['name', 'club'] }
          ]
        });
      }

      if (!type || type === 'donations') {
        const donationWhere = { ...where };
        if (club) donationWhere.club = club;
        if (startDate || endDate) donationWhere.donationDate = dateFilter;

        donations = await Donation.findAll({
          where: donationWhere,
          include: [
            {
              model: User,
              as: 'donor',
              attributes: ['firstName', 'lastName', 'email'],
              required: false
            }
          ]
        });
      }

      const membershipTotal = membershipFees.reduce((sum, f) => sum + parseFloat(f.amount), 0);
      const ticketTotal = eventTickets.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
      const donationTotal = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

      res.status(200).json({
        success: true,
        data: {
          membershipFees,
          eventTickets,
          donations,
          summary: {
            membershipTotal,
            ticketTotal,
            donationTotal,
            grandTotal: membershipTotal + ticketTotal + donationTotal
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async refundPayment(req, res) {
    try {
      const { type, id } = req.params;

      if (type === 'membership') {
        const fee = await MembershipFee.findByPk(id);
        if (!fee) return res.status(404).json({ success: false, error: 'Membership fee not found' });

        fee.status = 'refunded';
        await fee.save();
        res.status(200).json({ success: true, data: fee, message: 'Membership fee refunded' });
      } else if (type === 'ticket') {
        const ticket = await EventTicket.findByPk(id);
        if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

        ticket.status = 'refunded';
        await ticket.save();
        res.status(200).json({ success: true, data: ticket, message: 'Ticket refunded' });
      } else if (type === 'donation') {
        const donation = await Donation.findByPk(id);
        if (!donation) return res.status(404).json({ success: false, error: 'Donation not found' });

        donation.status = 'refunded';
        await donation.save();
        res.status(200).json({ success: true, data: donation, message: 'Donation refunded' });
      } else {
        res.status(400).json({ success: false, error: 'Invalid payment type' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new PaymentController();
