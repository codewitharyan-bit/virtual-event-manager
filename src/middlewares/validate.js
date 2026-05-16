const { validationResult } = require('express-validator');
const apiError = require('../utils/apiError');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    
    throw new apiError(400, errors.array()[0].msg);
  }

  next();
};