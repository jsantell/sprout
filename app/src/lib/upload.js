var _ = require('underscore');

function Upload(file, emitter) {
  if (!(this instanceof Upload)) return new Upload(file, emitter);
  this.emitter = emitter;
  this.file = file;
  file.slice = file.slice || file.webkitSlice;
}
module.exports = Upload;

/**
 * Upload to the given `path`.
 * 
 * @param {String} path
 * @param {Function} [fn]
 * @api public
 */

Upload.prototype.to = function(path, fn){
  // TODO: x-browser
  var self = this;
  fn = fn || function(){};
  var req = this.req = new XMLHttpRequest;
  req.open('POST', path);
  req.onload = this.onload.bind(this);
  req.onerror = this.onerror.bind(this);
  req.upload.onprogress = this.onprogress.bind(this);
  req.onreadystatechange = function(){
    if (4 == req.readyState) {
      var type = req.status / 100 | 0;
      if (2 == type) return fn(null, req);
      var err = new Error(req.statusText + ': ' + req.response);
      err.status = req.status;
      fn(err);
    }
  };
  var body = new FormData;
  body.append('file', this.file);
  req.send(body);
};

/**
 * Abort the XHR.
 *
 * @api public
 */

Upload.prototype.abort = function() {
  this.emitter.trigger('abort');
  this.req.abort();
};
  
/**
 * Error handler.
 *
 * @api private
 */
 
Upload.prototype.onerror = function(e){
  this.emitter.trigger('error', e);
};

/**
 * Onload handler.
 *
 * @api private
 */
 
Upload.prototype.onload = function(e){
  this.emitter.trigger('end', this.req);
};
  
/**
 * Progress handler.
 *
 * @api private
 */

Upload.prototype.onprogress = function(e){
  e.percent = e.loaded / e.total * 100;
  this.emitter.trigger('progress', e);
};
