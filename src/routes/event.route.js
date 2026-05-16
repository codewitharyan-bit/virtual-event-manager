const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const { validate } = require('../middlewares/validate');
const { createEventValidator } = require('../validators/eventValidator');
const auth = require('../middlewares/auth.middleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

router.post('/', auth, createEventValidator, validate, eventController.createEvent);
router.post('/:id/register', auth, eventController.registerForEvent);
router.get('/:id/participants', auth, eventController.getParticipants);

router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;