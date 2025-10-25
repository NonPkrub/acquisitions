import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      default:
        limit = 5;
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warm('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('User-agent'),
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated request are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warm('Shield Blocked request ', {
        ip: req.ip,
        userAgent: req.get('User-agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by Arcjet Shield',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warm('Shield Blocked request ', {
        ip: req.ip,
        userAgent: req.get('User-agent'),
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Too many requests',
      });
    }
    next();
  } catch (e) {
    logger.error('Arcjet Middleware Error', e);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
