const eventModel = require('../models/event.model');
const userModel = require('../models/user.model');
const { sendRegistrationEmail } = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const apiError = require('../utils/apiError');
const apiResponse = require('../utils/apiResponse');


const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, time, location } = req.body;
    if (!title || !date || !time) {
        throw new apiError(400, 'Title, date and time are required');
    }

    const event = await eventModel.create({
        title,
        date,
        time,
        description,
        organizer: req.user._id
    });

    return res.status(201).json(
        new apiResponse(201, event, 'Event created successfully')
    );

});


const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventModel.findById(req.params.id);
    if (!event) {
        throw new apiError(404, 'Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Not authorized');
    }

    const allowedFields = ['title', 'date', 'time', 'description'];
    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedEvent = await eventModel.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new apiResponse(200, updatedEvent, 'Event updated')
    );
})

const deleteEvent = asyncHandler(async (req, res) => {
    const event = await eventModel.findById(req.params.id);

    if (!event) {
        throw new apiError(404, 'Event not found');
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
        throw new apiError(403, 'Not authorized');
    }

    await event.deleteOne();

    return res.status(200).json(
        new apiResponse(200, null, 'Event deleted successfully')
    );
});

const registerForEvent = asyncHandler(async (req, res) => {
    const event = await eventModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { participants: req.user._id } },
        { new: true }
    );

    if (!event) {
        throw new apiError(404, 'Event not found');
    }

    const user = await userModel.findById(req.user._id);

    sendRegistrationEmail(user.email, user.name, event.title)
        .catch(err => console.error('Email error:', err));

    return res.status(200).json(
        new apiResponse(200, event, 'Successfully registered')
    );
});


const getParticipants = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const event = await eventModel.findById(req.params.id);

    if (!event) {
        throw new apiError(404, 'Event not found');
    }

    const participants = await userModel.find({
        _id: { $in: event.participants }
    })
        .select('name email')
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json(
        new apiResponse(200, participants)
    );
});

const getAllEvents = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const events = await eventModel.find()
        .select('title date time organizer')
        .populate('organizer', 'name')
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    return res.status(200).json(
        new apiResponse(200, events)
    );
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await eventModel.findById(req.params.id)
        .populate('organizer', 'name email')
        .lean();

    if (!event) {
        throw new apiError(404, 'Event not found');
    }

    return res.status(200).json(
        new apiResponse(200, event)
    );
});


module.exports = {
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    getParticipants,
    getAllEvents,
    getEventById
}