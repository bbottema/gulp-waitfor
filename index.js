'use strict';

var map = require('map-stream');
var gutil = require('gulp-util');
var waitForCondition = require('waitfor-condition');
var _log = console.log;

module.exports = function(settingsOrCondition, timeoutOrUndefined, intervalOrUndefined) {
  
  return map(function(file, cb) {
    waitForCondition(settingsOrCondition, timeoutOrUndefined, intervalOrUndefined).then(
      function()      { cb(null, file) },
      function(error) { cb(error, file); }
    );
  });
};