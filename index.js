'use strict';

var map = require('map-stream');
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

    _log('waitFor: started waiting until condition met or timeout (' + settings.timeout + 'ms)');

    var timedOut = false;
    var timeoutId = setTimeout(function() {
      timedOut = true;
    }, settings.timeout);

    var waitingForResult = false;
    var intervalId = setInterval(function() {
      if (!waitingForResult) {
        waitingForResult = true;
        settings.condition(function(conditionResult) {
          if (conditionResult) {
            if (!timedOut) {
              _log('waitFor: condition met result was (' + conditionResult + ')');
              finishWaitFor(true);
            }
            else {
              _log('waitFor: condition met, but not before timeout (result was ' + conditionResult + ')');
            }
          }
          waitingForResult = false;
        });
      }
      if (timedOut) {
        _log('waitFor: timeout after ' + settings.timout + ' milliseconds');
        finishWaitFor(false);
      }
    }, settings.interval);

    function finishWaitFor(success) {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      timeoutId = intervalId = null;
      invokeAfter(success);
      cb(null, file);
    }
  });

  function invokeBefore() {
    if (typeof settings.before === 'function') {
      _log('waitFor: invoking before()');
      settings.before();
    }
  }

  function invokeAfter(success) {
    if (typeof settings.after === 'function') {
      _log('waitFor: invoking after()');
      settings.after(success);
    }
  }
};