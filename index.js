'use strict';

var map = require('map-stream');
var gutil = require('gulp-util');
var _log = console.log;

var DEFAULT_TIMEOUT_MS = 60 * 1000; // 1 minute in milliseconds
var DEFAULT_INTERVAL_MS = 500; // 500 milliseconds (taken from Ant's waitFor.http condition)

module.exports = function(settingsOrCondition, timeoutOrUndefined, intervalOrUndefined) {

  var settings = (typeof settingsOrCondition === 'object' && settingsOrCondition) || {
    condition: settingsOrCondition,
    verbose: true
  };

  settings.timeout = settingsOrCondition.timeout || timeoutOrUndefined || DEFAULT_TIMEOUT_MS;
  settings.interval = settingsOrCondition.interval || intervalOrUndefined || DEFAULT_INTERVAL_MS;

  if (typeof settings.condition !== 'function') {
    throw new Error("argument should be a function or contain a function property 'condition'");
  }

  _log = settings.verbose ? _log : function() {};

  return map(function(file, cb) {
    invokeBefore();

    _log('gulp-waitfor: started waiting until condition met or timeout (' + settings.timeout + 'ms)');

    var timedOut = false;
    var timeoutId = setTimeout(function() {
      _log('[timeout occurred]');
      timedOut = true;
    }, settings.timeout);

    var waitingForResult = false;
    var intervalId = setInterval(function() {
      _log('[interval triggered]', 'timedOut:', timedOut, 'waitingForResult:', waitingForResult);
      if (!waitingForResult) {
        waitingForResult = true;
        settings.condition(function(conditionResult) {
          if (conditionResult) {
            if (!timedOut) {
              _log('gulp-waitfor: condition met result was (' + conditionResult + ')');
              finishWaitFor(true);
            }
            else {
              _log('gulp-waitfor: condition met, but not before timeout (result was ' + conditionResult + ')');
            }
          }
          waitingForResult = false;
        });
      }
      else if (timedOut) {
        _log('gulp-waitfor: timeout after ' + settings.timeout + ' milliseconds');
        finishWaitFor(false, new gutil.PluginError('gulp-waitfor', 'gulp-waitfor: timeout after ' + settings.timeout + ' milliseconds'));
      }
    }, settings.interval);

    function finishWaitFor(success, errorMsg) {
      _log('[finishWaitFor]');
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      timeoutId = intervalId = null;
      invokeAfter(success);
      cb(errorMsg, file);
    }
  });

  function invokeBefore() {
    if (typeof settings.before === 'function') {
      _log('gulp-waitfor: invoking before()');
      settings.before();
    }
  }

  function invokeAfter(success) {
    if (typeof settings.after === 'function') {
      _log('gulp-waitfor: invoking after()');
      settings.after(success);
    }
  }
};