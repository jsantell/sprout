var applications = require("./routes/applications");
var environments = require("./routes/environments");

module.exports = function (app) {

  // For Deployment hooks
  app.post("/api/deploy/:app/:env/:version", applications.deploy);

  // For client
  app.get("/api/applications", applications.index);
  app.get("/api/applications/:name", applications.read);
  app.get("/api/applications/:name/environments", applications.environment);
};
