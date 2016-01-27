'use strict';

var map = require('map-stream');
var gutil = require('gulp-util');
var waitForCondition = require('waitfor-condition');

module.exports = function(settingsOrCondition, timeoutOrUndefined, intervalOrUndefined) {
  
  return map(function(file, cb) {
    waitForCondition(settingsOrCondition, timeoutOrUndefined, intervalOrUndefined).then(
      function()      { cb(null, file) },
      function(error) { cb(new gutil.PluginError('gulp-waitfor', error.message), file); }
    );
  });
};