const helmet = require('helmet');

module.exports = ({ self = "'self'", frontendHosts = ["'self'"], apiHosts = ["'self'"] } = {}) =>
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: [self],
      scriptSrc: [self], // Avoid inline scripts
      styleSrc: [self, 'https:', 'data:'],
      imgSrc: [self, 'https:', 'data:'],
      fontSrc: [self, 'https:', 'data:'],
      connectSrc: [self, ...apiHosts, ...frontendHosts],
      frameAncestors: [self],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  });
