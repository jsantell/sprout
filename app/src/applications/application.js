var _ = require("underscore");
var moment = require("moment");
var View = require("../views/view");
var POLL_TIMER = 10000000;

module.exports = View.extend({
  name: "application",
  className: "application col-md-4",
  template: require("./application.hbs"),

  initialize: function (options) {
    var view = this;
    options = options || {};
    this.model  = options.model;
    this.poll();
  },

  poll: function () {
    var view = this;
    this.model.fetch().then(this.render.bind(this));
    setTimeout(function () { view.poll() }, POLL_TIMER);
  },

  getRenderData: function () {
    var data = this.model.toJSON();
    prettyDates(data);
    data.Environments.forEach(prettyDates);
    data.awsTooltip = data.aws ? "Application is on AWS" : "Application is not on AWS.";
    data.definedTooltip = data.defined ? "Application is defined via manifest." : "Application is not defined via manifest.";
    return data;
  },
});

function prettyDates (data) {
  data.lastUpdatedVague = data.DateUpdated ? ("Updated " + moment(data.DateUpdated, "YYYYMMDD").fromNow()) : "Not deployed on AWS.";
  data.lastUpdatedExact = data.DateUpdated ? moment(data.DateUpdated).format("MMMM Do YYYY, h:mm:ss a") : "Not deployed on AWS.";
}
