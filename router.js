var applications = require("./routes/applications");
var environments = require("./routes/environments");

module.exports = function (app) {

  app.get("/", function (req, res) {

  });

  // For Deployment hooks
//  app.post("/api/deploy/:application/:environment/:version", applications.deploy);

  // For client
  app.get("/api/applications", applications.index);
  app.get("/api/applications/:name", applications.read);
  app.get("/api/applications/:name/environments", applications.environments);

  //app.get("/api/environments/:name", environments.read);
};
