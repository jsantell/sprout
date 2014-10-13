// https://gist.github.com/db/966388
(function addXhrProgressEvent($) {
  var originalXhr = $.ajaxSettings.xhr;
  $.ajaxSetup({
    progress: function() { console.log("standard progress callback"); },
    xhr: function() {
      var req = originalXhr(), that = this;
      if (req) {
        if (typeof req.addEventListener == "function") {
          req.addEventListener("progress", function(evt) {
            that.progress(evt);
          },false);
        }
      }
      return req;
    }
  });
})(jQuery);
