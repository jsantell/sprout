var when = require("when");
var envConfig = { "SolutionStackName": "64bit Amazon Linux 2014.09 v1.0.8 running Node.js" };

function seedAWS (jackie) {
  return when.all([
    jackie.createApplication("api-service"),
    jackie.createApplication("sandbox"),
    jackie.createApplication("client")
  ]).then(function (apps) {
    return when.all([
      apps[0].createEnvironment("api-service-dev", envConfig),
      apps[0].createEnvironment("api-service-prod", envConfig),
      apps[1].createEnvironment("test", envConfig),
      apps[2].createEnvironment("client-dev", envConfig),
      apps[2].createEnvironment("client-prod", envConfig)
    ]);
  }).then(function (){});
}
exports.seedAWS = seedAWS;
