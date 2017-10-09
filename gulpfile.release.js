const gulp = require("gulp");
const babel = require("gulp-babel")

var path = require('path')
var env = 'production'

gulp.task('main-process', function() {
  return gulp.src(['./src/**/*.js','!./src/toolPages/**','!./src/render/**','!./src/extension/**','!./src/chromagnon/**'])
    .pipe(babel({}))
      .pipe(gulp.dest('./lib'))
});


gulp.task('main-process2', function() {
  return gulp.src(['./src/extension/chromeExtensionPath.js','./src/extension/backgroundScriptModify.js','./src/extension/contentScriptModify.js'])
    .pipe(babel({}))
    .pipe(gulp.dest('./lib/extension'))
});


gulp.task('main-process3', function() {
  return gulp.src(['./src/render/pubsub.js'])
    .pipe(babel({}))
    .pipe(gulp.dest('./lib/render'))
});


gulp.task('default', ['main-process','main-process2','main-process3']);
