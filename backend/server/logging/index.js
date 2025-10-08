const morgan = require('morgan');
module.exports = (app) => {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
};
