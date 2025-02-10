import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),

  (req: any, res: any, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];