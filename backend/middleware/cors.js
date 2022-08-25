const { CLIENT_URL } = process.env;

const addCORSHeader = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
};

module.exports = {
  addCORSHeader
};
