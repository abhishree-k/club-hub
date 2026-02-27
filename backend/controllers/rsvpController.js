const Event = require('../models/Event');
const EventRSVP = require('../models/EventRSVP');
const { sendNotificationToUser } = require('../notificationService');

const createRSVP = async (req, res) => {
  try {
    const { eventId, userId, notes } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingRSVP = await EventRSVP.findOne({
      where: { eventId, userId }
    });

    if (existingRSVP) {
      return res.status(400).json({ error: 'Already RSVPed to this event' });
    }

    const confirmedCount = await EventRSVP.count({
      where: { eventId, status: 'confirmed' }
    });

    let status = 'confirmed';

    if (event.capacity && confirmedCount >= event.capacity) {
      if (event.allowWaitlist && (!event.waitlistLimit || confirmedCount < event.capacity + event.waitlistLimit)) {
        status = 'waitlisted';
      } else {
        return res.status(400).json({ error: 'Event is full and waitlist is closed' });
      }
    }

    const rsvp = await EventRSVP.create({
      eventId,
      userId,
      status,
      notes,
      rsvpedAt: new Date()
    });

    if (status === 'confirmed') {
      await event.increment('currentAttendees');
    }

    if (global.sendNotificationToUser) {
      global.sendNotificationToUser(userId, {
        type: 'rsvp',
        title: `RSVP ${status === 'confirmed' ? 'Confirmed' : 'Waitlisted'}`,
        message: `Your RSVP for "${event.name}" has been ${status}.`,
        eventId
      });
    }

    res.status(201).json(rsvp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventRSVPs = async (req, res) => {
  try {
    const { eventId } = req.params;

    const rsvps = await EventRSVP.findAll({
      where: { eventId },
      order: [['rsvpedAt', 'ASC']]
    });

    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserRSVPs = async (req, res) => {
  try {
    const { userId } = req.params;

    const rsvps = await EventRSVP.findAll({
      where: { userId },
      include: [{
        model: Event,
        as: 'event'
      }],
      order: [['rsvpedAt', 'DESC']]
    });

    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRSVPStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, attended, notes } = req.body;

    const rsvp = await EventRSVP.findByPk(id);
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    const event = await Event.findByPk(rsvp.eventId);

    if (status === 'confirmed' && rsvp.status !== 'confirmed') {
      await event.increment('currentAttendees');
    }

    if (status === 'cancelled' && rsvp.status === 'confirmed') {
      await event.decrement('currentAttendees');
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (attended !== undefined) {
      updateData.attended = attended;
      if (attended) updateData.attendedAt = new Date();
    }
    if (notes !== undefined) updateData.notes = notes;

    await rsvp.update(updateData);

    res.json(rsvp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelRSVP = async (req, res) => {
  try {
    const { id } = req.params;

    const rsvp = await EventRSVP.findByPk(id);
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    if (rsvp.status === 'confirmed') {
      const event = await Event.findByPk(rsvp.eventId);
      await event.decrement('currentAttendees');

      const waitlistedRSVP = await EventRSVP.findOne({
        where: {
          eventId: rsvp.eventId,
          status: 'waitlisted'
        },
        order: [['rsvpedAt', 'ASC']]
      });

      if (waitlistedRSVP) {
        await waitlistedRSVP.update({ status: 'confirmed' });
        await event.increment('currentAttendees');

        if (global.sendNotificationToUser) {
          global.sendNotificationToUser(waitlistedRSVP.userId, {
            type: 'rsvp',
            title: 'Waitlist to Confirmed',
            message: `A spot has opened up for "${event.name}". You are now confirmed!`,
            eventId: event.id
          });
        }
      }
    }

    await rsvp.update({ status: 'cancelled' });

    res.json(rsvp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const rsvp = await EventRSVP.findByPk(id);
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    await rsvp.update({
      attended: true,
      attendedAt: new Date()
    });

    res.json(rsvp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventAttendanceReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    const rsvps = await EventRSVP.findAll({
      where: { eventId }
    });

    const totalRSVPs = rsvps.length;
    const confirmed = rsvps.filter(r => r.status === 'confirmed').length;
    const waitlisted = rsvps.filter(r => r.status === 'waitlisted').length;
    const cancelled = rsvps.filter(r => r.status === 'cancelled').length;
    const attended = rsvps.filter(r => r.attended).length;
    const noShows = confirmed - attended;

    res.json({
      totalRSVPs,
      confirmed,
      waitlisted,
      cancelled,
      attended,
      noShows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRSVP,
  getEventRSVPs,
  getUserRSVPs,
  updateRSVPStatus,
  cancelRSVP,
  markAttendance,
  getEventAttendanceReport
};
