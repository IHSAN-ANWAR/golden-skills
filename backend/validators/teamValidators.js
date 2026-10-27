import Joi from 'joi';

// Phone number validation (international format)
export const verifyTeamSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10-15 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    })
});

// Fraud report validation
export const fraudReportSchema = Joi.object({
  reporterName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Reporter name is required'
    }),
  reporterPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10-15 digits',
      'any.required': 'Phone number is required'
    }),
  suspiciousPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Suspicious phone number must be 10-15 digits',
      'any.required': 'Suspicious phone number is required'
    }),
  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    }),
  screenshot: Joi.string()
    .uri()
    .optional()
    .allow('')
});

// Blacklist validation
export const blacklistSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  name: Joi.string()
    .min(2)
    .max(100)
    .required(),
  reason: Joi.string()
    .min(10)
    .max(500)
    .required()
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};
