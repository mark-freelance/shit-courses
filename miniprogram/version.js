const config = require("config.js");

var isAuditVersion = function (serverVersion) {
  var clientVersion = config.data.version;
  if (serverVersion == clientVersion) {
    return true;
  }
  return false;
};

module.exports = {
  isAuditVersion: isAuditVersion,
};
