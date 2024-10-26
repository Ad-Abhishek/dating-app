import { validationResult } from 'express-validator';

const expressValidator = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((m) => m.msg),
    });
  }
  next();
};

export default expressValidator;
