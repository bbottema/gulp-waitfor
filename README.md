gulp-waitfor
=========

A gulp task that waits until a condition is met or until timeout.

## Example

The following gulp example will start some web server and delay the build until it is finished booting.

```javascript
var gulp = require('gulp');
var waitFor = require('gulp-waitfor');
var request = require('request');

gulp.task('run-e2e', function () {
    return gulp
        .spawn-your-server-process()
        .pipe(waitFor(function (cb) {
            request('http://localhost:1235/service/some-test-service', function (error, response) {
                cb(!error && response.statusCode === 200);
            });
        }))
        .pipe(... /* run rest of the build */);
});
```

## Options

There are two ways to invoke gulp-waitfor:

**Basic:**

```javascript
waitFor(function(cb) { /* cb(condition satisfied boolean)  */}, [timeoutMs], [intervalMs])
```

**Config object:**

```javascript
waitFor({
  before: function() { },
  condition: function(cb) { /* cb(condition satisfied boolean)  */},
  after: function(succes) { },
  interval: 500ms, // default is 500
  timeout: 60000ms, // default is 1 minute
  verbose: false, // default is true (false silences logging)
})
```
