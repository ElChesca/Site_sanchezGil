const { proxyToBaboons } = require('../lib/baboons-proxy');

module.exports = function handler(req, res) {
  return proxyToBaboons(req, res, '/api/public/sanchezgil/site-contact');
};
