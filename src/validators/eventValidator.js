const { body } = require('express-validator');



exports.createEventValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Max 100 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),

  body('time')
    .notEmpty().withMessage('Time is required'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Max 500 characters')
];

exports.updateEventValidator = [
  body().custom(value => {
    const allowedFields = ['title', 'date', 'time', 'description'];
    const requestFields = Object.keys(value);

    const isValid = requestFields.every(field =>
      allowedFields.includes(field)
    );

    if (!isValid) {
      throw new Error('Invalid fields in request');
    }

    return true;
  }),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Max 100 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),

  body('time')
    .optional(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Max 500 characters')
];